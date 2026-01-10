
export const CATEGORY_DATA = {
    plastic: {
        title: "Plastic Waste",
        definition: "Plastic waste includes items made from synthetic materials that do not decompose naturally.",
        icon: "ri-recycle-line",
        color: "#EF4444",
        subtypes: [
            {
                name: "Single-use Plastic",
                desc: "Items used once and discarded (carry bags, cups, straws).",
                image: "../images/categories/plastic_single_use.png"
            },
            {
                name: "Hard Plastic",
                desc: "Rigid items like bottles, containers, and toys.",
                image: "../images/categories/plastic_hard.png"
            },
            {
                name: "Multi-layered Plastic",
                desc: "Flexible packaging like chips packets and sachets.",
                image: "../images/categories/plastic_multilayer.png"
            }
        ],
        guidelines: [
            "Plastic waste must be cleaned and dried.",
            "Single-use plastics are banned in Kerala.",
            "Hand over to Haritha Karma Sena / authorized collection centers.",
            "Do NOT burn plastic waste."
        ],
        steps: [
            "Rinse plastic containers to remove food residue.",
            "Separate by type (Hard vs. Soft/Cover).",
            "Store in a dry bag.",
            "Hand over on collection day (usually monthly)."
        ],
        impact: {
            text: "Plastic takes hundreds of years to decompose. Microplastics enter the food chain and harm marine life. Burning releases toxic dioxins.",
            keywords: ["Marine Pollution", "Toxic Fumes", "Soil Degradation"]
        },
        do_image: "../images/categories/plastic_hard.png", // AI Generated
        dont_image: "../images/categories/plastic_dont_burn.jpg"
    },
    organic: {
        title: "Organic Waste",
        definition: "Biodegradable waste that comes from plants or animals and decomposes naturally.",
        icon: "ri-leaf-line",
        color: "#10B981",
        subtypes: [
            {
                name: "Kitchen Waste",
                desc: "Vegetable peels, fruit waste, leftover food.",
                image: "../images/categories/organic_kitchen_waste.png"
            },
            {
                name: "Garden Waste",
                desc: "Dry leaves, twigs, flowers.",
                image: "../images/categories/organic_garden_waste.png"
            },
            {
                name: "Meat & Bones",
                desc: "Non-vegetarian leftovers (requires longer composting).",
                image: "../images/categories/organic_meat_bones.png"
            }
        ],
        guidelines: [
            "Must be processed at the source (household level).",
            "Use bio-bins, pipe compost, or pot compost systems.",
            "Do NOT mix with plastic or glass.",
            "Use designated GREEN bins."
        ],
        steps: [
            "Segregate wet waste immediately.",
            "Drain excess water before composting.",
            "Add inoculum/sawdust to prevent smell.",
            "Mix occassionally for aeration."
        ],
        impact: {
            text: "Organic waste in landfills produces methane, a potent greenhouse gas. Composting turns it into nutrient-rich soil.",
            keywords: ["Methane Emission", "Soil Health", "Circular Economy"]
        },
        do_image: "../images/categories/organic_do_compost.png", // AI Generated
        dont_image: "../images/categories/organic_dont_mix.png" // AI Generated
    },
    paper: {
        title: "Paper Waste",
        definition: "Processed wood pulp materials like newspapers, cardboard, and office paper.",
        icon: "ri-book-open-line",
        color: "#F59E0B",
        subtypes: [
            {
                name: "Newspapers & Magazines",
                desc: "Clean, dry reading materials.",
                image: "../images/categories/paper_waste.png"
            },
            {
                name: "Cardboard",
                desc: "Packing boxes, cartons.",
                image: "../images/categories/paper_waste.png"
            }
        ],
        guidelines: [
            "Ensure paper is clean and dry.",
            "Soiled paper (food stains) cannot be recycled -> Compost it.",
            "Remove plastic tape or metal staples.",
            "Bundle and stack for easy collection."
        ],
        steps: [
            "Flatten carboard boxes.",
            "Stack newspapers neatly.",
            "Store in a dry area away from moisture.",
            "Sell to scrap dealers or hand over to HKS."
        ],
        impact: {
            text: "Recycling paper saves trees and water. One ton of recycled paper saves about 17 trees.",
            keywords: ["Deforestation", "Water Conservation", "Energy Saving"]
        },
        do_image: "../images/categories/paper_waste.png", // AI Generated
        dont_image: "../images/categories/paper_dont_soiled.png" // Crumpled/Wet
    },
    glass: {
        title: "Glass Waste",
        definition: "Non-biodegradable but 100% recyclable materials like bottles and jars.",
        icon: "ri-goblet-line",
        color: "#3B82F6",
        subtypes: [
            {
                name: "Intact Bottles",
                desc: "Whole bottles, jars.",
                image: "../images/categories/glass_waste.png"
            },
            {
                name: "Broken Glass",
                desc: "Shards, damaged glassware.",
                image: "../images/categories/glass_waste.png"
            }
        ],
        guidelines: [
            "Rinse thoroughly.",
            "Keep unbroken bottles separate from broken shards.",
            "Broken glass must be wrapped securely.",
            "Hand over to designated collection drives."
        ],
        steps: [
            "Wash the glass/bottles.",
            "Wrap broken glass in newspaper.",
            "Label 'BROKEN GLASS' to protect workers.",
            "Store safely until handover."
        ],
        impact: {
            text: "Glass never decomposes. Recycling glass reduces mining of raw materials like sand and limestone.",
            keywords: ["Energy Efficiency", "Landfill Reduction", "Safety"]
        },
        do_image: "../images/categories/glass_waste.png", // AI Generated
        dont_image: "../images/categories/glass_dont_break.jpg" // Broken/Mixed
    },
    ewaste: {
        title: "E-Waste",
        definition: "Discarded electronic devices, wires, and components.",
        icon: "ri-computer-line",
        color: "#8B5CF6",
        subtypes: [
            {
                name: "Gadgets",
                desc: "Phones, laptops, tablets.",
                image: "../images/categories/ewaste_gadgets.jpg" // Gadgets
            },
            {
                name: "Cables & Drivers",
                desc: "Chargers, wires, USB drives.",
                image: "../images/categories/ewaste_cables.jpg" // Cables
            }
        ],
        guidelines: [
            "Do NOT dismantle e-waste yourself.",
            "Store separately in a dry place.",
            "Hand over effectively to e-waste collection drives.",
            "Follow E-Waste Management Rules 2022."
        ],
        steps: [
            "Gather all old electronics.",
            "Keep them intact (don't break screens).",
            "Tape battery terminals if exposed.",
            "Drop off at nearest E-Waste Hub."
        ],
        impact: {
            text: "Contains toxic metals (lead, mercury) that poison soil and water. Precious metals like gold can be recovered.",
            keywords: ["Toxic Leakage", "Resource Recovery", "Soil Poisioning"]
        },
        do_image: "../images/categories/ewaste_do_dropoff.jpg", // E-waste electronics
        dont_image: "../images/categories/ewaste_dont_dump.jpg" // Burning/Dumping
    },
    hazardous: {
        title: "Hazardous Waste",
        definition: "Waste that poses substantial threats to public health or the environment.",
        icon: "ri-skull-line",
        color: "#DC2626",
        subtypes: [
            {
                name: "Household Chemicals",
                desc: "Paints, solvents, pesticides.",
                image: "../images/categories/hazardous_chemicals.jpg" // Paint cans
            },
            {
                name: "Medical/Sanitary",
                desc: "Used medicines, thermometers (mercury).",
                image: "../images/categories/hazardous_medical.jpg" // Medical
            }
        ],
        guidelines: [
            "Segregate strictly from other waste.",
            "Label containers clearly.",
            "Do not drain into sinks or toilets.",
            "Hand over to special hazardous waste facilities."
        ],
        steps: [
            "Keep in original containers if possible.",
            "Seal tightly to prevent leaks.",
            "Wear gloves when handling.",
            "Contact local authority for disposal schedule."
        ],
        impact: {
            text: "Can cause severe illness, water contamination, and fires. Extremely dangerous to sanitation workers.",
            keywords: ["Health Hazard", "Water Pollution", "Fire Risk"]
        },
        do_image: "../images/categories/hazardous_do_segregate.jpg",
        dont_image: "../images/categories/hazardous_dont_drain.jpg"
    }
};
