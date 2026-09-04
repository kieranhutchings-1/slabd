import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Category } from '../lib/categories'

/** The signed-in user's own category list, plus the operations Settings
 *  needs. Row-level security scopes every query, so no user filter here. */
export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order')
      .order('name')
    if (error) setError(error.message)
    else {
      setError(null)
      setCategories((data ?? []) as Category[])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const add = useCallback(
    async (name: string): Promise<string | null> => {
      const cleaned = name.trim()
      if (!cleaned) return 'A category needs a name.'

      const { data: auth } = await supabase.auth.getUser()
      const nextOrder = categories.reduce((max, c) => Math.max(max, c.sort_order), 0) + 1

      const { error } = await supabase
        .from('categories')
        .insert({ user_id: auth.user?.id, name: cleaned, sort_order: nextOrder })

      // The unique index is case-insensitive, so this is the path a
      // near-duplicate takes rather than quietly creating a second list.
      if (error) {
        return error.code === '23505'
          ? `You already have a category called "${cleaned}".`
          : error.message
      }
      await load()
      return null
    },
    [categories, load],
  )

  /** Renames the category and every card and want carrying it, in one
   *  database transaction. */
  const rename = useCallback(
    async (from: string, to: string): Promise<string | null> => {
      const cleaned = to.trim()
      if (!cleaned) return 'A category needs a name.'
      if (cleaned === from) return null

      const { error } = await supabase.rpc('rename_category', {
        old_name: from,
        new_name: cleaned,
      })
      if (error) {
        return error.code === '23505'
          ? `You already have a category called "${cleaned}".`
          : error.message
      }
      await load()
      return null
    },
    [load],
  )

  const remove = useCallback(
    async (category: Category): Promise<string | null> => {
      const { error } = await supabase.from('categories').delete().eq('id', category.id)
      if (error) return error.message
      await load()
      return null
    },
    [load],
  )

  const reorder = useCallback(
    async (ordered: Category[]): Promise<string | null> => {
      for (const [index, c] of ordered.entries()) {
        if (c.sort_order === index + 1) continue
        const { error } = await supabase
          .from('categories')
          .update({ sort_order: index + 1 })
          .eq('id', c.id)
        if (error) return error.message
      }
      await load()
      return null
    },
    [load],
  )

  return { categories, loading, error, reload: load, add, rename, remove, reorder }
}
