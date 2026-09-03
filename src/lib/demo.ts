import type { SlabCard } from '../components/Slab'
import { SUPABASE_URL } from './supabase'

/** The card shown in the marketing hero. A real one from the collection
 *  rather than a mock, so the hero shows exactly what the product renders,
 *  and hardcoded rather than fetched so the hero never depends on a network
 *  round trip to paint. */
export const heroCard: SlabCard = {
  player: 'Bruno Fernandes',
  year: '2024-2025',
  setName: 'Topps Reverence',
  autoType: 'Auto',
  serialNum: '02',
  serialTotal: '50',
  serialKind: 'Serial',
  grade: null,
  uniqueSerial: '1000000054',
  imageUrl: `${SUPABASE_URL}/storage/v1/object/public/card-images/2cd8913c-c530-4427-87d8-8a48079ba691/5a50f332-6cc3-402c-a833-49bd68aa7185.jpg`,
}
