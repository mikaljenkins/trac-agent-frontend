/**
 * 🧪 TEST DRIFT COMPARE
 * Manually invokes drift snapshot comparison for debugging or audits.
 */

import { compareRecentDriftSnapshots } from '../system/maintenance/compareRecentDriftSnapshots';

(async () => {
  const result = await compareRecentDriftSnapshots();
  console.log('🔍 Drift Comparison Result:', result);
})(); 