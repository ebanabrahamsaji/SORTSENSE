-- Comprehensive Kerala-wide Waste Collection Centers Seed
-- Normalized Types: mcf, scrap, recycler, ewaste, electronics_shop, kseb, hks, hospital, pcb, municipality, compost, biowaste, organic, plastic, metal, glass, general, charity, donation, thrift

-- 1. Insert Categories
INSERT IGNORE INTO tbl_categories (category_name, description) VALUES
('Plastic', 'All types of rigid and flexible plastics, bottles, and wrappers.'),
('Glass', 'Bottles, jars, and broken glass.'),
('Metal', 'Cans, foils, and metal scraps.'),
('Organic', 'Food waste, vegetable peels, and biodegradable matter.'),
('E-waste', 'Electronic gadgets, wires, batteries, and appliances.'),
('Paper', 'Newspapers, cardboard, and office paper.'),
('Hazardous', 'Medical waste, chemicals, and sanitary waste.'),
('Textile', 'Old clothes, fabric scraps, and donation items.');

-- 2. Insert Waste Items
INSERT IGNORE INTO tbl_waste_items (item_name, category_id, disposal_guideline, safety_instructions) VALUES
('Plastic Bottle', (SELECT category_id FROM tbl_categories WHERE category_name='Plastic'), 'Wash, dry, and squash. Give to Haritha Karma Sena.', 'Do not burn.'),
('Glass Jar', (SELECT category_id FROM tbl_categories WHERE category_name='Glass'), 'Rinse. Remove lids.', 'Handle broken glass with care.'),
('Organic Waste', (SELECT category_id FROM tbl_categories WHERE category_name='Organic'), 'Compost in bio-bin.', 'Do not mix with plastic.'),
('E-Waste Items', (SELECT category_id FROM tbl_categories WHERE category_name='E-waste'), 'Store dry. Hand over to e-waste drives.', 'Do not dismantle batteries.');

-- 3. Insert Collection Centers (Normalized)
INSERT IGNORE INTO tbl_collection_centers (center_name, type, latitude, longitude, address, contact_person, notes) VALUES

-- Thiruvananthapuram
('KELTRON E-waste Center', 'ewaste', 8.5085, 76.9538, 'Vellayambalam, TVM', 'Manager', 'State Govt e-waste collection.'),
('Trivandrum Scrap Market', 'scrap', 8.4980, 76.9400, 'Chala, TVM', 'Dealer', 'Mixed scrap buying.'),
('Trivandrum Smart Dump', 'general', 8.5241, 76.9366, 'Palayam, Trivandrum', 'Warden', 'General waste.'),
('Capital Bio-Compost', 'compost', 8.5450, 76.9200, 'Kesavadasapuram, TVM', 'Manager', 'Organic waste composting.'),
('Technopark E-Waste Hub', 'ewaste', 8.5581, 76.8816, 'Kazhakkoottam, TVM', 'Admin', 'IT park e-waste collection.'),
('City Scrap Traders TVM', 'scrap', 8.4875, 76.9486, 'Chala Market, TVM', 'Owner', 'Buys metal, paper, plastic.'),
('KIMS Bio-Medical Unit', 'hospital', 8.5126, 76.9080, 'Anayara, TVM', 'Safety Officer', 'Hazardous medical waste.'),
('Attingal Municipality MCF', 'mcf', 8.6958, 76.8142, 'Attingal, TVM', 'Health Inspector', 'Clean plastic collection.'),
('HKS Unit Trivandrum', 'hks', 8.5200, 76.9300, 'Trivandrum', 'Secretary', 'HKS Collection Point.'),

-- Kollam
('Kollam Corp MCF', 'mcf', 8.8932, 76.6141, 'Chinnakada, Kollam', 'Supervisor', 'Material Collection Facility.'),
('Ashtamudi Waste Sol', 'general', 8.9000, 76.5800, 'Thoppilkadavu, Kollam', 'Manager', 'General waste processing.'),
('Kollam Scrap Mart', 'scrap', 8.8800, 76.6000, 'Beach Road, Kollam', 'Dealer', 'Scrap buying center.'),
('District Hospital Kollam', 'hospital', 8.8850, 76.5900, 'Kollam Town', 'RMO', 'Biomedical waste.'),

-- Pathanamthitta
('Pathanamthitta Clean City', 'municipality', 9.2648, 76.7870, 'Ring Road, Pathanamthitta', 'Coord', 'Municipal collection.'),
('Tiruvalla Medical College', 'hospital', 9.3833, 76.5741, 'Tiruvalla', 'Admin', 'Hazardous waste.'),
('Adoor Scrap Corner', 'scrap', 9.1528, 76.7356, 'Adoor Town', 'Owner', 'Metal and Plastic scrap.'),
('Konni Eco-Point', 'organic', 9.2333, 76.8333, 'Konni', 'Forest Dept', 'Organic waste for compost.'),

-- Alappuzha
('Alappuzha Venice Clean', 'plastic', 9.4981, 76.3388, 'Alappuzha Beach', 'Volunteer', 'Plastic recycling.'),
('Kuttanad Agri-Waste', 'organic', 9.4167, 76.4667, 'Kuttanad', 'Officer', 'Agricultural organic waste.'),
('Cherthala E-Bin', 'kseb', 9.6833, 76.3333, 'Cherthala', 'KSEB', 'Electronics dropoff.'),

-- Kottayam
('Kottayam Eco-Collection Hub', 'general', 9.5916, 76.5222, 'Kottayam Town', 'District Coord', 'Mixed waste.'),
('Northamps Env Solutions', 'recycler', 9.5940, 76.5250, 'Muttambalam, Kottayam', 'Manager', 'Certified e-waste recycler.'),
('Techazar Electronics', 'electronics_shop', 9.5850, 76.5300, 'Kottayam Town', 'Owner', 'Electronics repair and scrap.'),
('Greenbhoomi Recyclers', 'ewaste', 9.6000, 76.5100, 'Kodimatha, Kottayam', 'Supervisor', 'Sustainable waste mgmt.'),
('E-Waste Kiliroor', 'ewaste', 9.6200, 76.4900, 'Kiliroor, Kottayam', 'Coordinator', 'Community collection.'),
('Spice Route Ventures', 'recycler', 9.5700, 76.5400, 'Kanjikuzhy, Kottayam', 'Director', 'E-waste processing.'),
('Kottayam Medical College', 'hospital', 9.6191, 76.5540, 'Gandhinagar, Kottayam', 'RMO', 'Medical waste.'),
('Erumely E-Waste Drop', 'ewaste', 9.4795, 76.7865, 'Erumely Town', 'Panchayat', 'E-waste bin.'),
('KSEB Section Office', 'kseb', 9.5800, 76.5200, 'Kottayam', 'Engineer', 'CFL/Battery drop.'),
('HKS Unit Kottayam', 'hks', 9.5900, 76.5200, 'Kottayam', 'Secretary', 'Haritha Karma Sena collection.'),
('HKS Kanjirapally', 'hks', 9.5586, 76.7822, 'Kanjirapally', 'Secretary', 'HKS Unit Kanjirapally.'),
('Kanjirapally Scrap Merchants', 'scrap', 9.5550, 76.7850, 'Kanjirapally Town', 'Owner', 'Buying e-waste and metal.'),
('Amal Jyothi E-Waste Center', 'ewaste', 9.5545, 76.8222, 'Koovapally', 'Manager', 'E-waste collection for college.'),

-- Idukki
('Idukki Township Waste', 'municipality', 9.8494, 76.9723, 'Painavu, Idukki', 'Secretary', 'Township waste.'),
('Munnar Green Spot', 'plastic', 10.0889, 77.0595, 'Munnar', 'Tourism', 'Plastic bottle collection.'),
('Thodupuzha Scrap', 'scrap', 9.8958, 76.7121, 'Thodupuzha', 'Dealer', 'Recyclables.'),

-- Ernakulam
('Kochi Corporation Bio-Plant', 'compost', 9.9692, 76.2705, 'Brahmapuram, Kochi', 'Officer', 'Large scale compost.'),
('Clean Kerala E-Waste Kochi', 'ewaste', 10.0270, 76.3080, 'Kalamassery, Kochi', 'Unit Head', 'Public e-waste sector.'),
('Kochi Scrap Dealers', 'scrap', 9.9800, 76.2800, 'Ernakulam North', 'Owner', 'Quick cash for e-waste.'),
('CleanKerala MCF Edappally', 'mcf', 10.0267, 76.3088, 'Edappally Toll', 'Head', 'Plastic shredding.'),
('Rahul Scrap & Electronics', 'scrap', 10.0300, 76.3100, 'Edappally', 'Rahul', 'Scrap dealer.'),
('City Mobile & Laptop Care', 'electronics_shop', 9.9700, 76.2800, 'MG Road, Kochi', 'Tech', 'Dead electronics.'),
('Town Scrap Yard', 'scrap', 9.9400, 76.2600, 'Vyttila, Kochi', 'Owner', 'Buying scrap.'),
('Lulu Connect E-Bin', 'electronics_shop', 10.0270, 76.3080, 'Lulu Mall', 'Manager', 'E-waste dropoff.'),
('District General Hospital', 'hospital', 9.9700, 76.2800, 'Ernakulam', 'RMO', 'Hazardous waste.'),
('Hope Charity Foundation', 'charity', 9.9650, 76.2900, 'Palarivattom', 'Vol', 'Clothes donation.'),
('City Thrift Store', 'thrift', 10.0100, 76.3300, 'Kakkanad', 'Keeper', 'Thrift store.'),
('Aluva Market Waste', 'organic', 10.1076, 76.3516, 'Aluva', 'Market Sec', 'Organic waste.'),
('HKS Unit Kochi', 'hks', 9.9700, 76.2800, 'Kochi', 'Secretary', 'HKS Collection Point.'),

-- Thrissur
('Thrissur Corp Waste', 'municipality', 10.5276, 76.2144, 'Thrissur Round', 'Corp', 'Municipal waste.'),
('Sakthan Scrap Corner', 'scrap', 10.5180, 76.2100, 'Sakthan Stand', 'Owner', 'Iron and plastic.'),
('Amala Medical Waste', 'hospital', 10.5600, 76.1800, 'Amala Nagar', 'Safety', 'Biomedical.'),
('Chalakudy Plastic Unit', 'recycler', 10.3070, 76.3350, 'Chalakudy', 'Manager', 'Plastic recycling.'),

-- Palakkad
('Palakkad Clean Fort', 'municipality', 10.7867, 76.6548, 'Palakkad Fort Area', 'Auth', 'Public bins.'),
('Steel City Scrap', 'metal', 10.7900, 76.6600, 'Industrial Area', 'Manager', 'Metal scrap.'),
('Malampuzha Green', 'plastic', 10.8300, 76.6800, 'Malampuzha', 'Tourism', 'Plastic free zone.'),

-- Malappuram
('Malappuram Municipality', 'municipality', 11.0510, 76.0711, 'Malappuram Town', 'Health', 'General collection.'),
('Manjeri Medical Disposal', 'hospital', 11.1200, 76.1200, 'Manjeri', 'RMO', 'Hazardous.'),
('Tirur Scrap Yard', 'scrap', 10.9100, 75.9200, 'Tirur', 'Dealer', 'E-waste and metal.'),

-- Kozhikode
('Kozhikode Recycling Unit', 'recycler', 11.2588, 75.7804, 'West Hill, Kozhikode', 'Manager', 'Plastic recycling.'),
('Kozhikode E-waste Recycler', 'ewaste', 11.2700, 75.7900, 'Nadakkavu, Kozhikode', 'Coordinator', 'Authorized e-waste center.'),
('Kozhikode Scrap Dealers', 'scrap', 11.2500, 75.7850, 'Big Bazaar, Calicut', 'Owner', 'We buy old computers.'),
('Mavoor Road Scrap', 'scrap', 11.2600, 75.7900, 'Mavoor Road', 'Owner', 'General scrap.'),
('Calicut E-Hub', 'ewaste', 11.2500, 75.7700, 'Beach Road', 'Vol', 'E-waste campaign.'),
('Baby Memorial Hazard', 'hospital', 11.2700, 75.8000, 'Kozhikode', 'Safety', 'Hospital waste.'),

-- Wayanad
('Kalpetta Green Shop', 'organic', 11.6103, 76.0827, 'Kalpetta', 'Kudumbashree', 'Organic and plastic.'),
('Sulthan Bathery Clean', 'municipality', 11.6667, 76.2667, 'Sulthan Bathery', 'Municipality', 'Town waste.'),
('Wayanad Eco-Resort', 'plastic', 11.6500, 76.1000, 'Vythiri', 'Manager', 'Plastic collection.'),

-- Kannur
('Kannur Waste Sol', 'general', 11.8745, 75.3704, 'Kannur Town', 'Corp', 'Waste management.'),
('Pariyaram Generic', 'hospital', 12.0500, 75.3100, 'Pariyaram', 'RMO', 'Medical college waste.'),
('Thalassery Scrap', 'scrap', 11.7500, 75.4900, 'Thalassery', 'Dealer', 'Metal and E-waste.'),

-- Kasaragod
('Kasaragod Town Clean', 'municipality', 12.5102, 74.9852, 'Kasaragod', 'Municipality', 'Town cleaning.'),
('Kanhangad Recycle', 'plastic', 12.3167, 75.0667, 'Kanhangad', 'Unit', 'Plastic shredding.'),
('Central University E-Bin', 'ewaste', 12.3900, 75.0900, 'Periye', 'Admin', 'University e-waste.');

-- 4. Link Centers to Categories (Using Lowercase Normalized Types)
INSERT IGNORE INTO tbl_accepted_categories (center_id, category_id)
SELECT c.center_id, cat.category_id 
FROM tbl_collection_centers c
JOIN tbl_categories cat ON 
    -- ORGANIC → compost, biowaste, organic, municipality, hks, mcf (as MCF handles bio too)
    (cat.category_name = 'Organic' AND (
        c.type IN ('organic', 'compost', 'biowaste', 'mcf', 'hks', 'general', 'municipality')
    )) OR

    -- PLASTIC → mcf, scrap, recycler, hks, plastic, municipality
    (cat.category_name = 'Plastic' AND (
        c.type IN ('plastic', 'mcf', 'scrap', 'recycler', 'hks', 'general', 'municipality')
    )) OR

    -- GLASS → scrap, recycler, mcf, glass
    (cat.category_name = 'Glass' AND (
        c.type IN ('glass', 'scrap', 'recycler', 'mcf', 'general')
    )) OR

    -- METAL → scrap, recycler, metal
    (cat.category_name = 'Metal' AND (
        c.type IN ('metal', 'scrap', 'recycler', 'general')
    )) OR

    -- HAZARDOUS → hospital, pcb, municipality
    (cat.category_name = 'Hazardous' AND (
        c.type IN ('hospital', 'pcb', 'municipality', 'general')
    )) OR

    -- E-WASTE → ewaste, scrap, electronics_shop, mobile_shop, computer_shop, kseb, recycler, mcf, hks
    (cat.category_name = 'E-waste' AND (
        c.type IN ('ewaste', 'scrap', 'electronics_shop', 'mobile_shop', 'computer_shop', 'kseb', 'recycler', 'mcf', 'hks')
    )) OR

    -- TEXTILE → scrap, donation, charity, thrift, hks, mcf
    (cat.category_name = 'Textile' AND (
        c.type IN ('textile', 'scrap', 'charity', 'thrift', 'donation', 'hks', 'mcf')
    )) OR

    -- PAPER → scrap, recycler, hks, mcf, municipality, general
    (cat.category_name = 'Paper' AND (
        c.type IN ('paper', 'scrap', 'recycler', 'hks', 'mcf', 'municipality', 'general')
    ));
