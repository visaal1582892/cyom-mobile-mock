const SLOTS = new Set(['breakfast', 'morningSnack', 'lunch', 'snacks', 'dinner']);
const logs = {
    "1730000_1_breakfast_uuid-123": true,
    "demo-plan_2_snacks_mock_extra_123_456": true
};
const consumedUuids = new Set();
Object.keys(logs).forEach(k => {
    if (!logs[k]) return;
    const parts = k.split('_');
    const slotIdx = parts.findIndex(p => SLOTS.has(p));
    if (slotIdx !== -1 && slotIdx < parts.length - 1) {
        const uuid = parts.slice(slotIdx + 1).join('_');
        if (uuid) consumedUuids.add(uuid);
    }
});
console.log(Array.from(consumedUuids));
