
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
                image: "../images/categories/glass_intact_bottles_v2.png"
            },
            {
                name: "Broken Glass",
                desc: "Shards, damaged glassware.",
                image: "../images/categories/glass_broken_shards_v2.png"
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
        do_image: "../images/categories/glass_do_store_v2.png", // Clean bottles in box
        dont_image: "../images/categories/glass_dont_mix_v2.png" // Broken/Mixed
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
                image: "../images/categories/ewaste_gadgets_v2.png" // Gadgets
            },
            {
                name: "Cables & Drivers",
                desc: "Chargers, wires, USB drives.",
                image: "../images/categories/ewaste_cables_v2.png" // Cables
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
        do_image: "../images/categories/ewaste_do_dropoff_v2.png", // E-waste electronics
        dont_image: "../images/categories/ewaste_dont_dump_v2.png" // Burning/Dumping
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
                image: "../images/categories/hazardous_chemicals_v2.png" // Paint cans
            },
            {
                name: "Medical/Sanitary",
                desc: "Used medicines, thermometers (mercury).",
                image: "../images/categories/hazardous_medical_v2.png" // Medical
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
        do_image: "../images/categories/hazardous_do_store_v2.png",
        dont_image: "../images/categories/hazardous_dont_drain_v2.png"
    }
};

export const CATEGORY_DATA_ML = {
    plastic: {
        title: "പ്ലാസ്റ്റിക് മാലിന്യം (Plastic Waste)",
        definition: "കഴുകി വൃത്തിയാക്കി ഉണക്കി സൂക്ഷിക്കേണ്ട സിന്തറ്റിക് വസ്തുക്കൾ.",
        icon: "ri-recycle-line",
        color: "#EF4444",
        subtypes: [
            {
                name: "സിംഗിൾ യൂസ് പ്ലാസ്റ്റിക്",
                desc: "ഒറ്റത്തവണ ഉപയോഗിച്ച് കളയുന്നവ (കവറുകൾ, സ്ട്രോ).",
                image: "../images/categories/plastic_single_use.png"
            },
            {
                name: "ഹാർഡ് പ്ലാസ്റ്റിക്",
                desc: "കുപ്പികൾ, കളിപ്പാട്ടങ്ങൾ, പാത്രങ്ങൾ.",
                image: "../images/categories/plastic_hard.png"
            },
            {
                name: "മൾട്ടി ലെയർ പ്ലാസ്റ്റിക്",
                desc: "മിഠായി കവറുകൾ, ചിപ്സ് പാക്കറ്റുകൾ.",
                image: "../images/categories/plastic_multilayer.png"
            }
        ],
        guidelines: [
            "പ്ലാസ്റ്റിക് കഴുകി ഉണക്കി സൂക്ഷിക്കുക.",
            "ഭക്ഷണ മാലിന്യങ്ങളുമായി കലർത്തരുത്.",
            "ഹരിത കർമ്മ സേനയ്ക്ക് കൈമാറുക.",
            "പ്ലാസ്റ്റിക് കത്തിക്കുന്നത് നിയമവിരുദ്ധമാണ്."
        ],
        steps: [
            "ഭക്ഷണ അവശിഷ്ടങ്ങൾ കഴുകി കളയുക.",
            "തരംതിരിച്ച് സൂക്ഷിക്കുക.",
            "നനയാതെ സൂക്ഷിക്കുക.",
            "മാസത്തിലൊരിക്കൽ ഏൽപ്പിക്കുക."
        ],
        impact: {
            text: "പ്ലാസ്റ്റിക് മണ്ണിൽ ലയിക്കാൻ നൂറ്റാണ്ടുകൾ എടുക്കും. കത്തിക്കുന്നത് കാൻസറിന് കാരണമാകുന്ന വിഷവാതകങ്ങൾ പുറപ്പെടുവിക്കുന്നു.",
            keywords: ["സമുദ്ര മലിനീകരണം", "വിഷവാതകം", "മണ്ണിലെ ഘടന മാറ്റുന്നു"]
        },
        do_image: "../images/categories/plastic_hard.png",
        dont_image: "../images/categories/plastic_dont_burn.jpg"
    },
    organic: {
        title: "ജൈവ മാലിന്യം (Organic Waste)",
        definition: "അഴുകുന്ന മാലിന്യങ്ങൾ (ഭക്ഷണം, ഇലകൾ మొదലായവ).",
        icon: "ri-leaf-line",
        color: "#10B981",
        subtypes: [
            {
                name: "അടുക്കള മാലിന്യം",
                desc: "പച്ചക്കറി അവശിഷ്ടങ്ങൾ, ഭക്ഷണം.",
                image: "../images/categories/organic_kitchen_waste.png"
            },
            {
                name: "തോട്ടത്തിലെ മാലിന്യം",
                desc: "ഉണങ്ങിയ ഇലകൾ, പൂക്കൾ.",
                image: "../images/categories/organic_garden_waste.png"
            },
            {
                name: "മാംസ അവശിഷ്ടങ്ങൾ",
                desc: "മീൻ, ഇറച്ചി അവശിഷ്ടങ്ങൾ.",
                image: "../images/categories/organic_meat_bones.png"
            }
        ],
        guidelines: [
            "ഉറവിടത്തിൽ തന്നെ സംസ്ക്കരിക്കുക.",
            "കമ്പോസ്റ്റ് അല്ലെങ്കിൽ ബയോഗ്യാസ് ഉപയോഗിക്കുക.",
            "പ്ലാസ്റ്റിക്കുമായി കലർത്തരുത്.",
            "പച്ച ബിന്നുകൾ ഉപയോഗിക്കുക."
        ],
        steps: [
            "വെള്ളം വാർന്നുപോകാൻ അനുവദിക്കുക.",
            "ഇനോക്കുലം അല്ലെങ്കിൽ ചകിരിച്ചോറ് ചേർക്കുക.",
            "വായു സഞ്ചാരം ഉറപ്പാക്കുക.",
            "വളമായി ഉപയോഗിക്കുക."
        ],
        impact: {
            text: "ജൈവ മാലിന്യം വെറുതെ കളഞ്ഞാൽ മീഥേൻ വാതകം ഉണ്ടാകുന്നു. കമ്പോസ്റ്റ് ചെയ്താൽ നല്ല വളമായി മാറുന്നു.",
            keywords: ["മീഥേൻ", "മണ്ണിന്റെ ഗുണമേന്മ", "വളം"]
        },
        do_image: "../images/categories/organic_do_compost.png",
        dont_image: "../images/categories/organic_dont_mix.png"
    },
    paper: {
        title: "പേപ്പർ മാലിന്യം (Paper Waste)",
        definition: "പുനരുപയോഗിക്കാൻ കഴിയുന്ന പേപ്പറുകൾ, കാർഡ്ബോർഡുകൾ.",
        icon: "ri-book-open-line",
        color: "#F59E0B",
        subtypes: [
            {
                name: "പത്രങ്ങൾ & മാസികകൾ",
                desc: "വൃത്തിയുള്ള ഉണങ്ങിയ പേപ്പറുകൾ.",
                image: "../images/categories/paper_waste.png"
            },
            {
                name: "കാർഡ്ബോർഡ്",
                desc: "പായ്ക്കിംഗ് പെട്ടികൾ.",
                image: "../images/categories/paper_waste.png"
            }
        ],
        guidelines: [
            "പേപ്പർ നനയാതെ സൂക്ഷിക്കുക.",
            "ഭക്ഷണം പുരണ്ട പേപ്പർ കമ്പോസ്റ്റ് ചെയ്യുക.",
            "സ്റ്റാപ്ലർ പിൻ മാറ്റുക.",
            "കെട്ടുകളായി സൂക്ഷിക്കുക."
        ],
        steps: [
            "പെട്ടികൾ പരത്തി വെക്കുക.",
            "പത്രങ്ങൾ അടുക്കി വെക്കുക.",
            "നനയാത്ത സ്ഥലത്ത് സൂക്ഷിക്കുക.",
            "ആക്രികടയിൽ കൊടുക്കുക."
        ],
        impact: {
            text: "പേപ്പർ റീസൈക്കിൾ ചെയ്യുന്നത് മരങ്ങളെയും വെള്ളത്തെയും സംരക്ഷിക്കുന്നു.",
            keywords: ["വനനശീകരണം തടയുന്നു", "ജലസംരക്ഷണം", "ഊർജ്ജ ലാഭം"]
        },
        do_image: "../images/categories/paper_waste.png",
        dont_image: "../images/categories/paper_dont_soiled.png"
    },
    glass: {
        title: "ഗ്ലാസ് മാലിന്യം (Glass Waste)",
        definition: "100% റീസൈക്കിൾ ചെയ്യാവുന്ന കുപ്പികളും ചില്ലുകളും.",
        icon: "ri-goblet-line",
        color: "#3B82F6",
        subtypes: [
            {
                name: "കുപ്പികൾ",
                desc: "പൊട്ടാത്ത കുപ്പികൾ, ഭരണികൾ.",
                image: "../images/categories/glass_intact_bottles_v2.png"
            },
            {
                name: "ചില്ലുകൾ",
                desc: "പൊട്ടിയ കുപ്പികൾ, കണ്ണാടി കഷ്ണങ്ങൾ.",
                image: "../images/categories/glass_broken_shards_v2.png"
            }
        ],
        guidelines: [
            "കഴുകി വൃത്തിയാക്കുക.",
            "പൊട്ടിയ ചില്ലുകൾ പേപ്പറിൽ പൊതിയുക.",
            "മറ്റ് മാലിന്യങ്ങളുമായി കലർത്തരുത്.",
            "പ്രത്യേക കളക്ഷൻ സമയത്ത് നൽകുക."
        ],
        steps: [
            "കുപ്പികൾ കഴുകുക.",
            "സുരക്ഷിതമായി പൊതിഞ്ഞു വെക്കുക.",
            "'BROKEN GLASS' എന്ന് എഴുതി ഒട്ടിക്കുക.",
            "കൈകാര്യം ചെയ്യുന്നവർക്ക് മുറിവേൽക്കാതെ നോക്കുക."
        ],
        impact: {
            text: "ഗ്ലാസ് ഒരിക്കലും മണ്ണിൽ ലയിക്കില്ല. റീസൈക്കിൾ ചെയ്യുന്നത് ഊർജ്ജം ലാഭിക്കുന്നു.",
            keywords: ["ഊർജ്ജ ലാഭം", "സുരക്ഷ", "ഖനനം കുറയ്ക്കുന്നു"]
        },
        do_image: "../images/categories/glass_do_store_v2.png",
        dont_image: "../images/categories/glass_dont_mix_v2.png"
    },
    ewaste: {
        title: "ഇ-വേസ്റ്റ് (E-Waste)",
        definition: "ഉപയോഗശൂന്യമായ ഇലക്ട്രോണിക് സാധനങ്ങൾ.",
        icon: "ri-computer-line",
        color: "#8B5CF6",
        subtypes: [
            {
                name: "ഗാഡ്‌ജെറ്റുകൾ",
                desc: "ഫോൺ, ലാപ്‌ടോപ്പ്, ടാബ്‌ലെറ്റ്.",
                image: "../images/categories/ewaste_gadgets_v2.png"
            },
            {
                name: "വയറുകൾ & കേബിളുകൾ",
                desc: "ചാർജറുകൾ, വയറുകൾ.",
                image: "../images/categories/ewaste_cables_v2.png"
            }
        ],
        guidelines: [
            "സ്വയം അഴിക്കാൻ ശ്രമിക്കരുത്.",
            "നനയാതെ സൂക്ഷിക്കുക.",
            "ഇ-വേസ്റ്റ് കളക്ഷൻ സെന്ററിൽ നൽകുക.",
            "സാധാരണ വേസ്റ്റിൽ ഇടരുത്."
        ],
        steps: [
            "പഴയ സാധനങ്ങൾ എടുത്തു വെക്കുക.",
            "പൊട്ടിക്കാതെ സൂക്ഷിക്കുക (സ്ക്രീനുകൾ).",
            "ബാറ്ററി ടെർമിനലുകൾ ടേപ്പ് ഒട്ടിക്കുക.",
            "അംഗീകൃത ഏജൻസിക്ക് കൈമാറുക."
        ],
        impact: {
            text: "ഇലക്ട്രോണിക് മാലിന്യങ്ങളിൽ ലെഡ്, മെർക്കുറി തുടങ്ങിയ വിഷാംശങ്ങളുണ്ട്. ശരിയായി സംസ്കരിച്ചാൽ സ്വർണം ഉൾപ്പെടെയുള്ള ലോഹങ്ങൾ തിരിച്ചെടുക്കാം.",
            keywords: ["വിഷാംശം", "ലോഹങ്ങൾ വീണ്ടെടുക്കൽ", "മണ്ണിലെ വിഷാംശം"]
        },
        do_image: "../images/categories/ewaste_do_dropoff_v2.png",
        dont_image: "../images/categories/ewaste_dont_dump_v2.png"
    },
    hazardous: {
        title: "അപകടകരമായ മാലിന്യം",
        definition: "ആരോഗ്യത്തിന് ഹാനികരമായ രാസവസ്തുക്കൾ അടങ്ങിയവ.",
        icon: "ri-skull-line",
        color: "#DC2626",
        subtypes: [
            {
                name: "വീട്ടുപയോഗ സാധനങ്ങൾ",
                desc: "പെയിന്റ്, കീടനാശിനി, ക്ലീനിംഗ് ദ്രാവകങ്ങൾ.",
                image: "../images/categories/hazardous_chemicals_v2.png"
            },
            {
                name: "മെഡിക്കൽ വേസ്റ്റ്",
                desc: "മരുന്നുകൾ, തെർമോമീറ്റർ, സിറിഞ്ച്.",
                image: "../images/categories/hazardous_medical_v2.png"
            }
        ],
        guidelines: [
            "മറ്റുള്ളവയുമായി കലർത്തരുത്.",
            "കുട്ടികൾക്ക് എത്താത്തിടത്ത് വെക്കുക.",
            "സിങ്കിലോ ടോയ്‌ലറ്റിലോ ഒഴിക്കരുത്.",
            "പ്രത്യേക കളക്ഷൻ സെന്ററിൽ നൽകുക."
        ],
        steps: [
            "പഴയ കുപ്പിയിൽ തന്നെ സൂക്ഷിക്കുക.",
            "ചോർച്ചയില്ലെന്ന് ഉറപ്പാക്കുക.",
            "കൈയുറകൾ ഉപയോഗിക്കുക.",
            "അധികൃതരുമായി ബന്ധപ്പെടുക."
        ],
        impact: {
            text: "ജലസ്രോതസ്സുകളെ മലിനമാക്കുന്നു. ജീവന് ഭീഷണിയാകാം.",
            keywords: ["ആരോഗ്യ പ്രശ്നങ്ങൾ", "ജല മലിനീകരണം", "തീപിടുത്ത സാധ്യത"]
        },
        do_image: "../images/categories/hazardous_do_store_v2.png",
        dont_image: "../images/categories/hazardous_dont_drain_v2.png"
    }
};
