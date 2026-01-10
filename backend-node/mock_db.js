export const WASTE_CATEGORIES = [
    {
        id: 1,
        name: 'plastic',
        disposal_method: 'Clean & give to Haritha Karma Sena.',
        rules: 'Wash to remove food residue. Do not burn. Store in dry place.',
        color: '#EF4444'
    },
    {
        id: 2,
        name: 'organic',
        disposal_method: 'Compost at source or use community bio-bins.',
        rules: 'Use green bins. Do not mix with plastic. Cover to prevent flies.',
        color: '#10B981'
    },
    {
        id: 3,
        name: 'ewaste',
        disposal_method: 'Handover to authorized collection centers.',
        rules: 'Do not dismantle. Keep dry. Store separately from other waste.',
        color: '#8B5CF6'
    },
    {
        id: 4,
        name: 'metal',
        disposal_method: 'Sell to scrap dealers or Haritha Karma Sena.',
        rules: 'Clean food cans. Watch out for sharp edges.',
        color: '#64748B'
    },
    {
        id: 5,
        name: 'glass',
        disposal_method: 'Rinse and hand over to scrap dealers.',
        rules: 'Wrap broken glass in newspaper. Keep bottles intact if possible.',
        color: '#3B82F6'
    },
    {
        id: 6,
        name: 'hazardous',
        disposal_method: 'Hand over to hazardous waste treatment facilities.',
        rules: 'Do not drain into sink. Keep in original container. Label clearly.',
        color: '#DC2626'
    },
    {
        id: 7,
        name: 'biomedical',
        disposal_method: 'Use yellow bags. Handover to IMAGE or authorized agency.',
        rules: 'Do not mix with general waste. High infection risk.',
        color: '#991B1B'
    },
    {
        id: 8,
        name: 'paper',
        disposal_method: 'Recycle via scrap dealers.',
        rules: 'Keep dry. Remove plastic covers or bindings.',
        color: '#F59E0B'
    },
    {
        id: 9,
        name: 'battery',
        disposal_method: 'Tape terminals. Drop off at e-waste/battery centers.',
        rules: 'Hazardous. Do not puncture or burn. Keep away from kids.',
        color: '#7C3AED'
    },
    {
        id: 10,
        name: 'mixed',
        disposal_method: 'Handover to HKS as rejects if accepted, or sanitary landfill.',
        rules: 'Try to segregate better next time. Do not burn.',
        color: '#374151'
    },
    {
        id: 11,
        name: 'sanitary',
        disposal_method: 'Securely wrap in newspaper (mark Red Cross). Handover separately.',
        rules: 'Biological hazard. Keep wrapped.',
        color: '#BE123C'
    },
    {
        id: 12,
        name: 'construction',
        disposal_method: 'Use designated C&D waste skips or collection service.',
        rules: 'Heavy dust! Wear mask. Watch for nails.',
        color: '#78350F'
    },
    {
        id: 13,
        name: 'agricultural',
        disposal_method: 'Compost at source or use as biomass fuel.',
        rules: 'Dry waste is flammable. Keep away from fire.',
        color: '#65A30D'
    }
];

export const COLLECTION_CENTERS = [
    { id: 1, name: "Municipal Plastic Collection Unit", category: "plastic", latitude: 9.9312, longitude: 76.2673, address: "Market Road, City Center" }, // Kochi approx
    { id: 2, name: "City Organic Compost Plant", category: "organic", latitude: 9.9400, longitude: 76.2700, address: "Green Zone, Park Avenue" },
    { id: 3, name: "E-Waste Recycling Hub", category: "ewaste", latitude: 9.9500, longitude: 76.2800, address: "IT Park Campus" },
    { id: 4, name: "Metal Scrap Yard", category: "metal", latitude: 9.9600, longitude: 76.2900, address: "Industrial Estate" },
    { id: 5, name: "Glass Recycling Facility", category: "glass", latitude: 9.9350, longitude: 76.2650, address: "Harbor View Road" },
    { id: 6, name: "Hazardous Waste Treatment Plant", category: "hazardous", latitude: 10.0000, longitude: 76.3500, address: "Outer Ring Road" },
    { id: 7, name: "Paper Recycling Depot", category: "paper", latitude: 9.9450, longitude: 76.2750, address: "Press Road" },
    // A duplicate closest one for testing location math
    { id: 8, name: "Local HKS Collection Point", category: "plastic", latitude: 8.5241, longitude: 76.9366, address: "Trivandrum City" }
];
