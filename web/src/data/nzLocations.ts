// Auto-generated from TradeMe Localities API (https://api.trademe.co.nz/v1/Localities.json).
// Regenerate by re-running the transform in scripts/ if the source changes.
// Hierarchy: Region -> District -> Suburb (15 regions, 79 districts, 2324 suburbs).

export const nzLocationHierarchy: Record<string, Record<string, string[]>> = {
  "Northland": {
    "Far North": ["Ahipara", "Awanui", "Awarua", "Broadwood", "Cable Bay", "Cape Reinga", "Cavalli Islands", "Coopers Beach", "Diggers Valley", "Fairburn", "Haruru", "Henderson Bay", "Herekino", "Hihi", "Hokianga", "Hokianga Harbour", "Horeke", "Houhora", "Kaeo", "Kaikohe", "Kaimaumau", "Kaingaroa", "Kaitaia", "Karetu", "Karikari Peninsula", "Kawakawa", "Kerikeri", "Kohukohu", "Koutu ", "Lake Ohia", "Mangamuka", "Mangatoetoe", "Mangonui", "Maromaku", "Mitimiti", "Moerewa", "Motutangi", "Ngataki", "Ohaeawai", "Okaihau", "Omanaia", "Omapere", "Opononi", "Opua", "Pakaraka", "Oue", "Paihia", "Pamapuria", "Panguru", "Paranui", "Peria", "Pukenui", "Pukepoto", "Rangiahua", "Rangiputa", "Rawene", "Rawhiti", "Russell", "Taheke", "Taipa", "Takahue", "Taupo Bay", "Tauranga Bay", "Tokerau Beach", "Totara North", "Towai", "Umawera", "Victoria Valley", "Waiharara", "Waima", "Waimamaku", "Waimate North", "Waiomio", "Waipapa", "Waipapakauri", "Whangape Harbour", "Whangaroa", "Whatuwhiwhi", "Whirinaki "],
    "Kaipara": ["Aranga", "Arapohue", "Aratapu", "Baylys Beach", "Dargaville", "Hakaru", "Kaihu", "Kaiwaka", "Kellys Bay", "Mangawhai", "Mangawhai Heads", "Mangawhare", "Matakohe", "Maungaturoto", "Pahi", "Paparoa", "Pouto", "Ruawai", "Tangiteroria", "Tangowahine", "Te Kopuru", "Tinopai", "Waipoua", "Whakapirau"],
    "Whangarei": ["Abbey Caves", "Avenues", "Bream Bay", "Central Whangarei", "Glenbervie", "Helena Bay", "Hikurangi", "Horahora", "Hukerenui", "Kamo", "Kauri", "Kensington", "Kokopu", "Langs Beach", "Mairtown", "Mangapai", "Marsden Point", "Marua", "Mata", "Matapouri", "Matarau", "Maungakaramea", "Maungatapere", "Maunu", "McLeod Bay", "Morningside", "Ngunguru", "Oakura Coast", "Oakleigh", "One Tree Point", "Onerahi", "Opuawhanga", "Otaika", "Otangarei", "Pakotai", "Parahaki", "Parua Bay", "Pataua", "Pataua North", "Pataua South", "Pipiwai", "Poroti", "Port Whangarei", "Regent", "Portland", "Purua", "Puwera", "Raumanga", "Riponui", "Riverside", "Ruakaka", "Ruatangata", "Sherwood Rise", "Springs Flat", "Taiharuru", "Taipuha", "Tamaterau", "Three Mile Bush", "Tikipunga", "Titoki", "Toetoe", "Tutukaka", "Vinetown", "Waikaraka", "Waikiekie", "Waiotira", "Waipu", "Waipu Cove", "Whakapara", "Whananaki", "Whangarei", "Whangarei Heads", "Whangaruru", "Whareora", "Whatitiri", "Whau Valley", "Wheki Valley", "Woodhill"],
  },
  "Auckland": {
    "Auckland City": ["Arch Hill", "Avondale", "Balmoral", "Blockhouse Bay", "City Centre", "Coxs Bay", "Eden Terrace", "Ellerslie", "Epsom", "Freemans Bay", "Glen Innes", "Glendowie", "Grafton", "Greenlane", "Grey Lynn", "Herne Bay", "Hillsborough", "Kingsland", "Kohimarama", "Lynfield", "Meadowbank", "Mission Bay", "Morningside", "Mount Albert", "Mount Eden", "Mount Roskill", "Mount Wellington", "New Windsor", "Newmarket", "Newton", "One Tree Hill", "Onehunga", "Orakei", "Oranga", "Otahuhu", "Owairaka", "Panmure", "Parnell", "Penrose", "Point Chevalier", "Point England", "Ponsonby", "Remuera", "Royal Oak", "Saint Heliers", "Saint Johns", "Saint Johns Park", "Saint Marys Bay", "Sandringham", "St Lukes", "Stonefields", "Tamaki", "Te Papapa", "Three Kings", "Wai O Taiki Bay", "Waikowhai", "Waterview", "Wesley", "Western Springs", "Westmere", "Wynyard Quarter"],
    "Franklin": ["Aka Aka", "Ararimu", "Awhitu", "Bombay", "Buckland", "Clarks Beach", "Glenbrook", "Harrisville", "Hunua", "Kaiaua", "Karaka", "Karaka Harbourside", "Kingseat", "Mangatangi", "Mangatawhiri", "Manukau Heads", "Maramarua", "Mauku", "Mercer", "Onewhero", "Otaua", "Paerata", "Paparimu", "Patumahoe", "Pokeno", "Pollok", "Port Waikato", "Pukekawa", "Pukekohe", "Pukekohe East", "Puni", "Ramarama", "Te Kohanga", "Tuakau", "Waiau Pa", "Waikaretu", "Waiuku", "Whakatiwai", "Wharekawa"],
    "Hauraki Gulf Islands": ["Great Barrier Island", "Kawau Island", "Rakino Island"],
    "Manukau City": ["Alfriston", "Beachlands", "Botany Downs", "Brookby", "Bucklands Beach", "Burswood", "Chapel Downs", "City Centre", "Clendon Park", "Clevedon", "Clover Park", "Cockle Bay", "Cumbria Downs", "Dannemora", "East Tamaki", "East Tamaki Heights", "Eastern Beach", "Farm Cove", "Favona", "Flat Bush", "Golflands", "Goodwood Heights", "Half Moon Bay", "Highland Park", "Hill Park", "Howick", "Huntington Park", "Kawakawa Bay", "Mahia Park", "Mangere", "Mangere Bridge", "Mangere East", "Manukau", "Manukau Heights", "Manurewa", "Manurewa East", "Maraetai", "Matingarahi", "Meadowlands", "Mellons Bay", "Mission Heights", "Northpark", "Omana Beach", "Orere", "Orere Point", "Otara", "Pakuranga", "Pakuranga Heights", "Papatoetoe", "Point View Park", "Puhinui", "Randwick Park", "Shamrock Park", "Shelly Park", "Somerville", "Sunnyhills", "The Gardens", "Totara Heights", "Totara Park", "Wattle Downs", "Weymouth", "Whitford", "Wiri"],
    "North Shore City": ["Albany", "Bayswater", "Bayview", "Beach Haven", "Belmont", "Birkdale", "Birkenhead", "Browns Bay", "Campbells Bay", "Castor Bay", "Chatswood", "Chester Park", "Crown Hill", "Devonport", "Fairview Heights", "Forrest Hill", "Glenfield", "Glenvar", "Greenhithe", "Hauraki", "Hillcrest", "Long Bay", "Lucas Heights", "Mairangi Bay", "Marlborough", "Meadowood", "Milford", "Murrays Bay", "Narrow Neck", "North Harbour", "Northcote", "Northcote Point", "Northcross", "Okura", "Oteha", "Paremoremo", "Pinehill", "Rosedale", "Rothesay Bay", "Schnapper Rock", "Stanley Bay", "Sunnynook", "Takapuna", "Torbay", "Totara Vale", "Unsworth Heights", "Waiake", "Wainoni", "Wairau Valley", "Westlake", "Windsor Park"],
    "Papakura": ["Ardmore", "Conifer Grove", "Drury", "Opaheke", "Pahurehure", "Papakura", "Red Hill", "Rosehill", "Runciman", "Takanini"],
    "Rodney": ["Ahuroa", "Albany Heights", "Algies Bay", "Arkles Bay", "Army Bay", "Big Manly", "Coatesville", "Dairy Flat", "Glorit", "Gulf Harbour", "Hatfields Beach", "Helensville", "Hobbs Bay", "Hoteo", "Huapai", "Kaipara Flats", "Kaukapakapa", "Kumeu", "Leigh", "Little Manly", "Mahurangi", "Mahurangi East", "Mahurangi West", "Makarau", "Mangakura", "Manly", "Matakana", "Matakatia Bay", "Maygrove", "Milldale", "Millwater", "Muriwai Beach", "Muriwai Valley", "Okura Bush", "Omaha", "Omaha Flats", "Orewa", "Pakiri", "Parakai", "Parkhurst", "Point Wells", "Puhoi", "Red Beach", "Redvale", "Riverhead", "Sandspit", "Shelly Beach", "Silverdale", "Snells Beach", "South Head", "Stanmore Bay", "Stillwater", "Streamlands", "Tahekeroa", "Tapora", "Tauhoa", "Taupaki", "Tawharanui Peninsula", "Te Arai", "Te Hana", "The Grange", "Tindalls Beach", "Tomarata", "Topuni", "Wade Heads", "Waikoukou Valley", "Waimauku", "Wainui", "Waitoki", "Waiwera", "Warkworth", "Wellsford", "Whangaparaoa", "Whangaripo", "Wharehine", "Woodcocks", "Woodhill"],
    "Waiheke Island": ["Awaawaroa Bay", "Blackpool", "Church Bay", "Connells Bay", "Cowes Bay", "Enclosure Bay", "Hekerua Bay", "Kennedy Point", "Little Oneroa", "Matiatia Bay", "Omiha", "Oneroa", "Onetangi", "Orapiu", "Ostend", "Palm Beach", "Rocky Bay", "Sandy Bay", "Surfdale", "Te Whau", "Te Whau Bay", "Waiheke Island", "Waikopou Bay", "Whakanewha", "Woodside Bay"],
    "Waitakere City": ["Anawhata", "Bethells Beach", "Cornwallis", "French Bay", "Glen Eden", "Glendene", "Green Bay", "Harbour View", "Henderson", "Henderson Valley", "Herald Island", "Hobsonville", "Huia", "Karekare", "Kelston", "Konini", "Laingholm", "Little Huia", "Massey", "Massey East", "Massey North", "Massey West", "Mclaren Park", "New Lynn", "Oratia", "Palm Heights", "Parau", "Piha", "Ranui", "Royal Heights", "Sunnyvale", "Swanson", "Te Atatu Peninsula", "Te Atatu South", "Titirangi", "Waiatarua", "Waima", "Waimanu Bay", "Waitakere", "West Harbour", "Western Heights", "Westgate", "Whatipu", "Whenuapai", "Wood Bay", "Woodlands Park"],
  },
  "Waikato": {
    "Hamilton": ["Avalon", "Bader", "Baverstock", "Beerescourt", "Burbush", "Chartwell", "Chedworth Park", "Claudelands", "Deanwell", "Dinsdale", "Enderley", "Fairfield", "Fairview Downs", "Fitzroy", "Flagstaff", "Forest Lake", "Frankton", "Glenview", "Grandview Heights", "Hamilton City Central", "Hamilton East", "Hamilton Lake", "Hamilton North", "Hamilton West", "Harrowfield", "Hillcrest", "Horsham Downs", "Huntington", "Livingstone", "Maeroa", "Melville", "Nawton", "Peacocke", "Pukemoremore", "Pukete", "Queenwood", "Riverlea", "Rotokauri ", "Rototuna", "Ruakura", "Rukuhia", "Saint Andrews", "Silverdale", "Te Rapa", "Temple View", "Thornton Estate", "Western Heights", "Whitiora"],
    "Hauraki": ["Awaiti", "Kaihere", "Karangahake", "Kerepehi", "Mangatarata", "Netherton", "Ngatea", "Orongo", "Paeroa", "Pipiroa", "Turua", "Waihi", "Waihi East", "Waikino", "Waitakaruru", "Whiritoa"],
    "Matamata-Piako": ["Hoe-O-Tainui", "Mangateparu", "Matamata", "Morrinsville", "Patetonga", "Springdale", "Tahuna", "Tauhei", "Te Aroha", "Te Poi", "Waharoa", "Waihou", "Waitoa", "Walton"],
    "Otorohanga": ["Aotea Harbour", "Kawhia", "Otorohanga"],
    "South Waikato": ["Arapuni", "Hodderville", "Kinleith", "Lichfield", "Ngatira", "Piarere", "Putaruru", "Tirau", "Tokoroa", "Wiltsdown"],
    "Taupo": ["Acacia Bay", "Bonshaw Park", "Broadlands Forest", "Hatepe", "Hilltop", "Invergarry", "Kinloch", "Kuratau", "Lake Taupo", "Mangakino", "Marotiri", "Maunganamu", "Motuoapa", "Nukuhau", "Ohakuri", "Omori", "Oruanui", "Oruatua", "Pukawa", "Rainbow Point", "Rangatira Park", "Richmond Heights", "Tauhara", "Tauranga Taupo", "Te Rangiita", "Tongariro", "Town Centre", "Turangi", "Two Mile Bay", "Waipahihi", "Wairakei", "Waitahanui", "Waitetoko", "Whareroa", "Wharewaka"],
    "Thames-Coromandel": ["Cooks Beach", "Coroglen", "Coromandel", "Ferry Landing", "Flaxmill Bay", "Hahei", "Hikuai", "Hikutaia ", "Hot Water Beach", "Kaimarama", "Kennedy Bay", "Kereta", "Kopu", "Kuaotunu Beach", "Matarangi", "Matatoki ", "Onemana", "Opito", "Opoutere", "Otama", "Pauanui", "Port Charles", "Puriri ", "Ruamahunga", "Slipper Island", "Tairua", "Tapu", "Tararu", "Te Mata", "Te Puru", "Te Rerenga", "Thames", "Thornton Bay", "Tuateawa", "Waiomu", "Whakatete Bay", "Whangamata", "Whangapoua", "Whenuakite", "Whitianga"],
    "Waikato": ["Arapuni", "Eureka", "Glen Afton", "Glen Massey", "Glen Murray", "Gordonton", "Hampton Downs", "Horotiu", "Huntly", "Kainui", "Matangi", "Meremere", "Miranda", "Newstead", "Ngaruawahia", "Ohinewai", "Oparau", "Orini", "Pukemiro", "Puketaha", "Raglan", "Rangiriri", "Rotongaro", "Ruawaro", "Tamahere", "Taupiri", "Tauwhare", "Te Akau", "Te Hoe", "Te Kauwhata", "Te Kowhai", "Te Uku", "Tirohanga", "Waerenga", "Waikaretu", "Waikato Surrounds", "Waiterimu", "Waitetuna", "Whakamaru", "Whatawhata", "Whitikahu"],
    "Waipa": ["Cambridge", "Horahora", "Kaipaki", "Karamu", "Karapiro", "Kihikihi", "Koromatua", "Leamington", "Maungatautari", "Ngahinapouri", "Ohaupo", "Pirongia", "Pukeatua", "Pukekura", "Rotoorangi", "Rukuhia ", "Te Awamutu", "Te Miro", "Te Pahu", "Te Rore", "Wharepapa South"],
    "Waitomo": ["Awakino", "Benneydale", "Marokopa", "Piopio", "Te Kuiti"],
  },
  "Bay Of Plenty": {
    "Kawerau": ["Kawerau"],
    "Opotiki": ["Hospital Hill", "Kutarere", "Ohiwa", "Opotiki", "Te Kaha", "Tirohanga", "Waihau Bay", "Waiotahi"],
    "Rotorua": ["Atiamuri", "Awahou", "Brunswick", "Fairy Springs", "Fenton Park", "Fordlands", "Glenholme", "Hamurana", "Hannahs Bay", "Hillcrest", "Holdens Bay", "Horohoro", "Kaharoa", "Kawaha Point", "Koutu", "Lake Okareka", "Lake Okataina", "Lake Rotoehu", "Lake Rotoma", "Lake Tarawera", "Lynmore", "Mamaku", "Mangakakahi", "Matipo Heights", "Mourea", "Ngakuru", "Ngapuna", "Ngongotaha", "Ngongotaha Valley", "Ohinemutu", "Okere Falls", "Owhata", "Pleasant Heights", "Pomare", "Pukehangi", "Reporoa", "Rerewhakaaitu", "Rotoiti", "Rotorua", "Selwyn Heights", "Springfield", "Sunnybrook", "Te Ngae", "Tihiotonga", "Tikitere", "Utuhina", "Victoria", "Waikite", "Waikite Valley", "Waiotapu", "Westbrook", "Western Heights", "Whakarewarewa"],
    "Tauranga": ["Arataki", "Avenues", "Bayfair", "Bellevue", "Bethlehem", "Brookfield", "Bureta", "Cambridge Heights", "Cherrywood", "City Centre", "Gate Pa", "Greerton", "Hairini", "Judea", "Kairua", "Matapihi", "Matua", "Maungatapu", "Merivale", "Minden", "Mount Maunganui", "Ohauiti", "Omanu", "Oropi", "Otumoetai", "Papamoa", "Papamoa Beach", "Parkvale", "Poike", "Pyes Pa", "Tauranga South", "Tauriko", "Te Maunga", "Wairoa", "Welcome Bay"],
    "Western Bay Of Plenty": ["Aongatete", "Apata", "Athenree", "Katikati", "Lower Kaimai", "Maketu", "Matakana Island", "Ohauiti", "Omanawa", "Omokoroa", "Oropi", "Paengaroa", "Pahoia", "Pongakawa", "Pukehina", "Pyes Pa", "Rangiuru", "Tahawai", "Tanners Point", "Te Puke", "Te Puna", "Waihi Beach", "Whakamarama"],
    "Whakatane": ["Awakaponga", "Awakeri", "Coastlands", "Edgecumbe", "Galatea", "Manawahe", "Matata", "Murupara", "Nukuhou North", "Ohope", "Onepu", "Otakiri", "Pahou", "Paroa", "Pikowai", "Poroporo", "Port Ohope", "Ruatoki North", "Taneatua", "Te Teko", "Thornton", "Waimana", "Wainui", "Whakatane"],
  },
  "Gisborne": {
    "Gisborne": ["Awapuni", "City Centre", "Elgin", "Hangaroa", "Hexton", "Hicks Bay", "Inner Kaiti", "Kaiti", "Lytton West", "Makaraka ", "Makauri", "Makorori", "Mangapapa", "Manutuke", "Matawai", "Matawhero", "Matokitoki", "Motu", "Muriwai", "Ngatapa", "Okitu", "Ormond", "Otoko", "Outer Kaiti", "Patutahi", "Pehiri", "Pouawa", "Raukumara", "Rere", "Riverdale", "Ruatoria", "Tahunga", "Tamarau", "Te Araroa", "Te Hapara", "Te Karaka", "Tiniroto", "Tokomaru Bay", "Tolaga Bay", "Waerengaahika", "Waerengaokuri", "Waihau Bay", "Waimata", "Waingake", "Wainui", "Waipaoa", "Waituhi", "Whangara", "Wharekopae", "Wharerata", "Whatatutu", "Whataupoko"],
  },
  "Hawke's Bay": {
    "Central Hawke's Bay": ["Aramoana", "Central Hawke's Bay Country", "Elsthorpe", "Flemington", "Hatuma", "Maraetotara", "Omakere", "Ongaonga", "Otane", "Patangata", "Porangahau", "Pourerere", "Takapau", "Tikokino", "Waipawa", "Waipukurau", "Wanstead"],
    "Hastings": ["Akina", "Bridge Pa", "Camberley", "Clive", "Crownthorpe", "Eskdale", "Fernhill", "Flaxmere", "Frimley", "Hastings Central", "Haumoana", "Havelock North", "Kahuranaki", "Karamu", "Kereru", "Longlands", "Mahora", "Mangatahi", "Mangateretere", "Maraekakaho", "Mayfair", "Moteo", "Omahu", "Otamauri", "Pakipaki", "Pakowhai", "Parkvale", "Patangata", "Patoka", "Poukawa", "Puketapu", "Puketitiri", "Putorino", "Raukawa", "Raureka", "Rissington", "Roys Hill", "Saint Leonards", "Sherenden", "Stortford Lodge", "Tangoio", "Te Awanga", "Te Hauke", "Te Pohue", "Tomoana", "Tuki Tuki", "Tutira", "Twyford", "Waimarama", "Waiohiki", "Waipatu", "Waiwhare", "Whakatu", "Whanawhana", "Whirinaki", "Woolwich"],
    "Napier": ["Ahuriri", "Awatoto", "Bay View", "Bluff Hill", "City Centre", "Greenmeadows", "Hospital Hill", "Jervoistown", "Maraenui", "Marewa", "Meeanee", "Mission View", "Napier South", "Onekawa", "Pandora", "Pirimai", "Poraiti", "Pukehamoamoa", "Tamatea", "Taradale", "Te Awa", "Westshore"],
    "Wairoa": ["Frasertown", "Kotemaori", "Mahanga", "Mahia", "Mahia Beach", "Marumaru", "Mohaka", "Morere", "Nuhaka", "Ruakituri", "Te Reinga", "Tuai", "Wairoa", "Whakaki"],
  },
  "Taranaki": {
    "New Plymouth": ["Bell Block", "Blagdon", "Brixton", "Brooklands", "City Centre", "Egmont Village", "Ferndale", "Fitzroy", "Frankleigh Park", "Glen Avon", "Highlands Park", "Hillsborough", "Hurdon", "Hurford", "Hurworth", "Inglewood", "Korito", "Koru", "Lepperton", "Lynmouth", "Mangorei", "Marfell", "Merrilands", "Mokau", "Moturoa", "New Plymouth", "Norfolk", "Oakura", "Okato", "Omata", "Onaero", "Pitone", "Ridgewood", "Royal Heights", "Sentry Hill", "Spotswood", "Strandon", "Tariki", "Tikorangi", "Tongaporutu", "Urenui", "Uruti", "Vogeltown", "Waitara", "Waiwhakaiho", "Welbourn", "Westown", "Whalers Gate"],
    "South Taranaki": ["Alton", "Auroa", "Awatuna", "Eltham", "Hawera", "Kaponga", "Manaia", "Mokoia", "Normanby", "Ohawe", "Okaiawa", "Opunake", "Otakeho", "Patea", "Pungarehu", "Te Kiri", "Tokaora", "Waitotara", "Warea", "Waverley"],
    "Stratford": ["Midhurst", "Stratford", "Stratford East", "Stratford West", "Toko"],
  },
  "Manawatu / Whanganui": {
    "Horowhenua": ["Foxton", "Foxton Beach", "Heatherlea", "Hokio Beach", "Ihakara", "Koputaroa", "Kuku", "Levin", "Manakau", "Muhunoa East", "Ohau", "Opiki", "Shannon", "Tokomaru", "Waikawa Beach", "Waitarere", "Waitarere Beach"],
    "Manawatu": ["Aorangi", "Apiti", "Awahuri", "Cheltenham", "Colyton", "Feilding", "Glen Oroua", "Halcombe", "Highbury", "Himatangi", "Himatangi Beach", "Hiwinui", "Kelvin Grove", "Kimbolton", "Mt Biggs", "Newbury", "Ohakea", "Parewanui", "Pohangina", "Rangiotu", "Rangiwahia", "Rongotea", "Sanson", "Tangimoana", "Waituna West", "Whakarongo"],
    "Palmerston North": ["Aokautere", "Ashhurst", "Awapuni", "Bunnythorpe", "City Centre", "Cloverlea", "Fitzherbert", "Highbury", "Hokowhitu", "Kairanga", "Kelvin Grove", "Linton", "Longburn", "Milson", "Papaioea", "Roslyn", "Takaro", "Terrace End", "Tiakitahuna", "Turitea", "Westbrook", "West End", "Whakarongo"],
    "Rangitikei": ["Bulls", "Hunterville", "Mangaweka", "Marton", "Ohingaiti", "Papanui Junction", "Parewanui", "Taihape", "Turakina", "Utiku"],
    "Ruapehu": ["Aukopae", "Erua", "Hikumutu", "Horopito", "Kaitieke", "Kakahi", "Kirikau", "Makakahi", "Manunui", "Matiere", "National Park", "Ngapuke", "Ohakune", "Ohura", "Ongarue", "Orautoha", "Otangiwai", "Owhango", "Parinui", "Pipiriki", "Raetihi", "Rangataua", "Raurimu", "Retaruke", "Ruatiti", "Tangiwai", "Taringamotu", "Taumarunui", "Tohunga Junction", "Tokirima", "Waimarino", "Waimiha", "Waiouru", "Waiouru Military Area", "Waitaanga"],
    "Tararua": ["Akitio", "Alfredton", "Dannevirke", "Eketahuna", "Herbertville", "Ihuraua", "Makotuku", "Norsewood", "Ormondville", "Pahiatua", "Pongaroa", "Woodville"],
    "Whanganui": ["Aberfeldy", "Aramoho", "Bastia Hill", "Brunswick", "Castlecliff", "City Centre", "College Estate", "Durie Hill", "Fordell", "Gonville", "Kai Iwi", "Kaitoke", "Kaiwhaiki", "Kakatahi", "Koitiata", "Makirikiri ", "Mangamahu ", "Marybank", "Matahiwi", "Maxwell", "Mosston", "Okoia", "Otamatea", "Papaiti", "Paparangi", "Parikino", "Putiki", "Ranana", "Rapanui", "Saint Johns Hill", "Springvale", "Tawhero", "Upokongaro", "Westmere", "Whangaehu", "Whanganui Central", "Whanganui East"],
  },
  "Wellington": {
    "Carterton": ["Carterton"],
    "Kapiti Coast": ["Otaihanga", "Otaki", "Otaki Beach", "Paekakariki", "Paraparaumu", "Paraparaumu Beach", "Peka Peka", "Raumati Beach", "Raumati South", "Reikorangi", "Te Horo", "Waikanae", "Waikanae Beach"],
    "Lower Hutt": ["Alicetown", "Avalon", "Belmont", "Boulcott", "Days Bay", "Eastbourne", "Epuni", "Fairfield", "Gracefield", "Harbour View", "Haywards", "Holborn", "Kelson", "Korokoro", "Lower Hutt", "Lowry Bay", "Mahina Bay", "Manor Park", "Maungaraki", "Melling", "Moera", "Muritai", "Naenae", "Normandale", "Park Avenue", "Petone", "Point Howard", "Rona Bay", "Seaview", "Stokes Valley", "Sunshine Bay", "Taita", "Tirohanga", "Wainuiomata", "Waiwhetu", "Waterloo", "Woburn", "York Bay"],
    "Masterton": ["Bideford", "Castlepoint", "Flat Point", "Masterton", "Mataikona", "Mauriceville", "Opaki", "Riversdale Beach", "Tauweru", "Whareama"],
    "Porirua": ["Aotea", "Ascot Park", "Camborne", "Cannons Creek", "Elsdon", "Judgeford", "Karehana Bay", "Kenepuru", "Linden", "Mana", "Papakowhai", "Paremata", "Pauatahanui", "Plimmerton", "Porirua", "Porirua East", "Pukerua Bay", "Ranui Heights", "Takapu Valley", "Takapuwahia", "Titahi Bay", "Waitangirua", "Whitby"],
    "South Wairarapa": ["Cape Palliser", "Featherston", "Gladstone", "Greytown", "Kahutara", "Lake Ferry", "Martinborough", "Ngawi", "Ocean Beach", "Tora"],
    "Upper Hutt": ["Akatarawa", "Birchville", "Blue Mountains", "Brown Owl", "Clouston Park", "Ebdentown", "Heretaunga", "Kaitoke", "Kingsley Heights", "Maoribank", "Maymorn", "Moonshine Valley", "Mount Marua", "Pakuratahi", "Pinehaven", "Riverstone Terraces", "Silverstream", "Te Marua", "The Plateau", "Timberlea", "Totara Park", "Mangaroa", "Trentham", "Upper Hutt", "Wallaceville", "Whitemans Valley", "Elderslea"],
    "Wellington": ["Aro Valley", "Berhampore", "Breaker Bay", "Broadmeadows", "Brooklyn", "Chartwell", "Churton Park", "Crawford", "Crofton Downs", "Evans Bay", "Glenside", "Grenada", "Grenada North", "Grenada Village", "Hataitai", "Highbury", "Horokiwi", "Houghton Bay", "Island Bay", "Johnsonville", "Kaiwharawhara", "Karaka Bays", "Karori", "Kelburn", "Khandallah", "Kilbirnie", "Kingston", "Kowhai Park", "Lambton", "Linden", "Lyall Bay", "Makara-Ohariu", "Maupuia", "Melrose", "Miramar", "Moa Point", "Mornington", "Mount Cook", "Mount Victoria", "Newlands", "Newtown", "Ngaio", "Ngauranga", "Northland", "Ohariu", "Oriental Bay", "Owhiro Bay", "Paparangi", "Pipitea", "Raroa", "Redwood", "Rongotai", "Roseneath", "Seatoun", "Seatoun Bays", "Seatoun Heights", "Southgate", "Strathmore Park", "Tawa", "Te Aro", "Thorndon", "Vogeltown", "Wadestown", "Wellington Central", "Wilton", "Woodridge"],
  },
  "Nelson / Tasman": {
    "Nelson": ["Annesbrook", "Atawhai", "Beachville", "Bishopdale", "Britannia Heights", "Cable Bay ", "City Centre", "Enner Glynn", "Hira", "Kikiwa", "Maitai", "Maitlands", "Marybank", "Moana", "Monaco", "Nayland", "Nelson", "Nelson East", "Nelson South", "Ngawhatu", "Port Hills", "Stepneyville", "Stoke", "Tahunanui", "Tahunanui Hills", "The Brook", "The Glen", "The Wood", "Todds Valley", "Toi Toi", "Wakapuaka", "Wakatu", "Washington Valley", "Whangamoa"],
    "Tasman": ["Aniseed Valley", "Appleby", "Bainham", "Best Island", "Brightwater", "Brooklyn", "Clifton", "Golden Bay", "Collingwood", "Dovedale", "Hope", "Howard", "Kaiteriteri", "Kohatu", "Korere", "Lower Moutere", "Mahana", "Mapua", "Marahau", "Motueka", "Motupiko", "Murchison", "Ngatimoti", "Onekaka", "Owen River", "Pakawau", "Parapara", "Patons Rock", "Pohara", "Puponga", "Rabbit Island", "Redwood Valley", "Richmond", "Riwaka", "Ruby Bay", "Saint Arnaud", "Stanley Brook", "Takaka", "Tapawera", "Tasman", "Tata Beach", "Upper Moutere", "Wakefield"],
  },
  "Marlborough": {
    "Blenheim": ["Blenheim", "Blenheim Central", "Burleigh", "Islington", "Mayfield", "Omaka", "Redwoodtown", "Riverlands", "Riversdale", "Springlands", "Witherlea", "Yelverton"],
    "Kaikoura": ["Goose Bay", "Kaikoura", "Kekerengu"],
    "Marlborough": ["Anakiwa ", "Awatere Valley", "Blind River", "Dashwood", "Fairhall", "Grovetown", "Havelock", "Hawkesbury", "Kenepuru Sounds", "Kaituna", "Kaiuma Bay", "Marlborough Sounds", "Koromiko", "Linkwater", "Mahau Sound", "Ngakuta Bay", "Pelorus Sounds", "North Bank", "North West Bay", "Okaramio", "Okiwi Bay", "Onamalutu Valley", "Queen Charlotte Sounds", "Picton", "Port Underwood", "Portage", "Punga Cove", "Rai Valley", "Rapaura", "Rarangi", "Renwick", "Seddon", "Spring Creek", "Tennyson Inlet", "Totaranui", "Tuamarina", "Waihopai Valley", "Waikawa", "Wairau Valley", "Ward", "Woodbourne"],
  },
  "West Coast": {
    "Buller": ["Cape Foulwind", "Carters Beach", "Charleston", "Fairdown", "Granity", "Hector", "Inangahua", "Karamea", "Little Wanganui", "Maruia", "Millerton", "Mokihinui", "Ngakawau", "Punakaiki", "Reefton", "Seddonville", "Springs Junction", "Waimangaroa", "Westport"],
    "Grey": ["Ahaura", "Barrytown", "Blackball", "Blaketown", "Camerons", "Cobden", "Dobson", "Dunollie", "Gladstone", "Greymouth", "Ikamatua", "Inchbonnie", "Kaiata", "Karoro", "Lake Brunner", "Marsden", "Moana", "Nelson Creek", "Ngahere", "Paroa", "Rapahoe", "Runanga", "Rutherglen", "South Beach", "Taylorville", "Totara Flat"],
    "Westland": ["Arahura Valley", "Awatuna", "Bruce Bay", "Fox Glacier", "Franz Josef", "Haast", "Harihari", "Hokitika", "Jacksons", "Kaniere", "Kokatahi", "Kowhitirangi", "Kumara", "Kumara Junction", "Moana", "Okarito", "Okuru", "Otira", "Pukekura", "Ross", "Whataroa "],
  },
  "Canterbury": {
    "Ashburton": ["Allenton", "Ashburton", "Chertsey", "Elgin", "Fairton", "Hampstead", "Hinds", "Huntingdon", "Lauriston", "Mayfield", "Methven", "Montalto", "Mt Somers", "Netherby", "Newland", "Rakaia", "Tinwald", "Willowby"],
    "Banks Peninsula": ["Akaroa", "Birdlings Flat", "Cass Bay", "Charteris Bay", "Diamond Harbour", "Duvauchelle", "Governors Bay", "Little Akaloa", "Little River", "Lyttelton", "Motukarara", "Okains Bay", "Pigeon Bay", "Port Levy", "Purau", "Teddington", "Wainui"],
    "Christchurch City": ["Addington", "Aidanfield", "Aranui", "Avondale", "Avonhead", "Avonside", "Balmoral Hill", "Barrington", "Beckenham", "Belfast", "Bexley", "Bishopdale", "Bromley", "Brookhaven", "Brooklands", "Broomfield", "Bryndwr", "Burnside", "Burwood", "Casebrook", "Cashmere", "Chaneys", "City Centre", "Clifton", "Cracroft", "Dallington", "Edgeware", "Eyreton", "Fendalton", "Ferrymead", "Forest Park", "Halswell", "Harewood", "Heathcote", "Hei Hei", "Hillmorton", "Hillsborough", "Hoon Hay", "Hornby", "Huntsbury", "Hyde Park", "Ilam", "Islington", "Kainga", "Kennedy's Bush", "Linwood", "Mairehau", "Marshland", "Merivale", "Middleton", "Moncks Bay", "Mount Pleasant", "Murray Aynsley", "New Brighton", "North Linwood", "North New Brighton", "Northcote", "Northshore", "Northwood ", "Oaklands", "Opawa", "Papanui", "Parklands", "Phillipstown", "Queenspark", "Ravenswood", "Redcliffs", "Redwood", "Riccarton", "Richmond", "Richmond Hill", "Russley", "Scarborough", "Shirley", "Sockburn", "Somerfield", "South New Brighton", "Southshore", "Spencerville", "Spreydon", "St. Albans", "St. Andrews Hill", "St. Martins", "Stewarts Gully", "Strowan", "Styx", "Sumner", "Sydenham", "Templeton", "Upper Riccarton", "Waimairi Beach", "Wainoni", "Waitikiri", "Waltham", "Westlake", "Westmorland", "Wigram", "Wigram Park", "Woolston", "Yaldhurst "],
    "Hurunui": ["Amberley", "Amberley Beach", "Balcairn", "Cheviot", "Culverden", "Domett", "Gore Bay", "Greta Valley", "Hanmer Springs", "Hawarden", "Leithfield", "Leithfield Beach", "Lewis Pass", "Lyford", "Motunau", "Oaro", "Omihi", "Rotherham", "Scargill", "Waiau", "Waikari", "Waipara"],
    "Mackenzie": ["Albury", "Burkes Pass ", "Cave", "Fairlie", "Lake Tekapo", "Mt Cook", "Twizel"],
    "Selwyn": ["Annat", "Arthurs Pass", "Broadfield", "Burnham", "Castle Hill Village", "Charing Cross", "Coalgate", "Darfield", "Doyleston", "Dunsandel", "Glentunnel", "Greendale", "Hororata", "Irwell", "Kirwee", "Kowai Bush", "Lake Coleridge", "Lake Ellesmere", "Leeston", "Lincoln", "Prebbleton", "Rolleston", "Russells Flat", "Sheffield", "Southbridge", "Springfield", "Springston", "Tai Tapu", "Waddington", "Weedons", "West Melton", "Windwhistle"],
    "Timaru": ["Arundel", "Claremont", "Geraldine", "Gleniti", "Glenwood", "Highfield", "Kensington", "Kerrytown", "Levels", "Maori Hill", "Marchwiel", "Oceanview", "Orari", "Pareora", "Parkside", "Pleasant Point", "Rangitata", "Redruth", "Rosewill", "Seadown", "Seaview", "Smithfield", "St Andrews", "Temuka", "Timaru", "Timaru Port", "Waimataitai", "Washdyke", "Watlington", "West End", "Winchester"],
    "Waimakariri": ["Ashley", "Ashley Gorge", "Bennetts", "Bexley", "Burnt Hill", "Carleton", "Clarkville", "Coldstream", "Coopers Creek", "Coutts Island", "Cust", "Eyrewell", "Fernside", "Flaxton", "Gammans Creek", "Glentui", "Horrellville", "Kaiapoi", "Kairaki", "Loburn", "Loburn North", "Ohapuku", "Ohoka", "Okuku", "Oxford", "Pegasus", "Pegasus Bay", "Pines Beach", "Rangiora", "Ravenswood", "Sefton", "Southbrook", "Springbank", "Summerhill", "Swannanoa", "Tuahiwi", "View Hill", "Waikuku", "Waikuku Beach", "West Eyreton", "White Rock", "Woodend", "Woodend Beach"],
    "Waimate": ["Glenavy", "Makikihi", "Saint Andrews", "Waimate"],
  },
  "Otago": {
    "Central Otago": ["Alexandra", "Clyde", "Cromwell", "Ettrick", "Ida Valley", "Kokonga", "Kyeburn", "Lauder", "Millers Flat", "Moa Flat", "Mount Pisa", "Naseby", "Omakau", "Ophir", "Oturehua", "Ranfurly", "Roxburgh", "Springvale", "St Bathans", "Tarras", "Wedderburn"],
    "Clutha": ["Balclutha", "Clinton", "Clydevale", "Heriot", "Inch Clutha", "Kaitangata", "Kaka Point", "Lawrence", "Leithen Bush", "Maclennan", "Milton", "Owaka", "Pounawea", "Taieri Mouth", "Tapanui", "Taumata", "Tuapeka Flat", "Tuapeka Mouth", "Waihola", "Waipahi", "Wairuna", "Waitahuna", "Waiwera South"],
    "Dunedin": ["Abbotsford", "Allanton", "Andersons Bay", "Aramoana", "Balaclava", "Belleknowes", "Berwick", "Blackhead", "Bradford", "Brighton", "Broad Bay", "Brockville", "Burnside", "Calton Hill", "Careys Bay", "Caversham", "City Centre", "Clyde Hill", "Company Bay", "Concord", "Corstorphine", "Dalmore", "East Taieri", "Doctors Point", "Evansdale", "Fairfield", "Forbury", "Glenleith", "Glenross", "Green Island", "Halfway Bush", "Harington Point", "Harwood", "Helensburgh", "Henley", "Heyward Point", "Highcliff", "Hindon", "Kaikorai", "Kaikorai Valley", "Karitane", "Kenmure", "Kensington", "Kew", "Kinmont Park", "Leith Valley", "Liberton", "Littlebourne", "Long Beach", "Lookout Point", "Macandrew Bay", "Maia", "Maori Hill", "Maryhill", "Maungatua", "Middlemarch", "Momona", "Mornington", "Mosgiel", "Mount Grand", "Mount Mera", "Mt Cargill", "Musselburgh", "Normanby", "North Dunedin", "North East Valley", "North Taieri", "Ocean Grove", "Ocean View", "Opoho", "Osborne", "Otago Peninsula", "Otakou", "Otokia", "Outram", "Pine Hill", "Port Chalmers", "Portobello", "Purakaunui", "Ravensbourne", "Roseneath", "Roslyn", "Saddle Hill", "Saint Clair", "Saint Clair Park", "Saint Kilda", "Saint Leonards", "Sawyers Bay", "Scroggs Hill", "Shiel Hill", "South Dunedin", "Tainui", "The Cove", "The Glen", "Upper Waitati", "Vauxhall", "Waikouaiti", "Waipori", "Waitati", "Wakari", "Waldronville", "Warrington", "Waverley", "Westgate", "Westwood", "Wingatui", "Woodhaugh"],
    "Queenstown-Lakes": ["Arrow Junction", "Arrowtown", "Arthurs Point", "Ben Lomond", "Boydtown", "Closeburn", "Crown Terrace", "Dalefield", "Drift Bay", "Fernhill", "Frankton", "Gibbston", "Glenorchy", "Goldfield Heights", "Jacks Point", "Kawarau Falls", "Kelvin Heights", "Kelvin Peninsula", "Kingston", "Lake Hayes", "Lake Hayes Estate", "Lake Wakatipu", "Lower Shotover", "Mount Creighton", "Queenstown East", "Queenstown Hill", "Speargrass Flat", "Sunshine Bay", "Town Centre"],
    "South Otago": ["Stirling"],
    "Waitaki": ["Alma", "Lake Ohau", "Awamoko", "Dunback", "Duntroon", "Enfield", "Glenavy", "Hampden", "Herbert", "Kakanui", "Kurow", "Maheno", "Moeraki", "Ngapara", "Oamaru", "Otematata", "Palmerston", "Pukeuri", "Sailors Cutting", "South Oamaru", "Taranui", "Totara", "Waiareka", "Waihemo", "Weston", "Windsor", "Omarama"],
    "Wanaka": ["Albert Town", "Cardrona", "Cattle flat", "Glendhu Bay", "Hawea Flat", "Hunter Valley", "Lake Hawea", "Queensberry", "Makarora", "Mount Aspiring", "Mount Barker", "The Neck", "Treble cone", "Wanaka", "Luggate"],
  },
  "Southland": {
    "Catlins": ["Curio Bay", "Progress Valley", "Tokanui", "Waikawa Valley"],
    "Gore": ["Conical Hill", "Gore", "Mataura", "Te Tipua", "Waimumu"],
    "Invercargill": ["Appleby", "Ascot", "Avenal", "Bluff", "City Centre", "Clifton", "Georgetown", "Gladstone", "Glengarry", "Grasmere", "Greenhills", "Hargest", "Hawthorndale", "Heidelberg", "Invercargill", "Kennington", "Kew", "Kingswell", "Longbush", "Lorneville", "Mabel Bush", "Makarewa", "Mataura Island", "Mokotua", "Myross Bush", "New River Ferry", "Newfield", "Omaui", "Otahuti", "Otatara", "Prestonville", "Richmond", "Rockdale", "Rosedale", "Roslyn Bush", "Ryal Bush", "Seaward Bush", "Strathern", "Tisbury", "Turnbull Thomson Park", "Tussock Creek", "Waikiwi", "Wallacetown", "Waverley", "West Plains", "Windsor", "Woodend"],
    "Southland": ["Ashers", "Athol", "Balfour", "Branxholme", "Browns", "Cattle Flat", "Centre Bush", "Colac Bay", "Dacre", "Dipton", "Dipton West", "Drummond", "Eastern Bush", "Edendale", "Feldwick", "Fortrose", "Garston", "Grove Bush", "Heddon Bush", "Hedgehope", "Isla Bank", "Limehills", "Lumsden", "Manapouri", "Mossburn", "Nightcaps", "Oban", "Ohai", "Orepuki", "Otama", "Otapiri", "Otautau", "Pine Bush", "Rakahouka", "Rimu", "Riversdale", "Riverton", "Ryal Bush", "South Hillend", "Stewart Island", "Te Anau", "Te Tipua", "Thornbury", "Tokanui", "Tuatapere", "Waianiwa", "Waikaia", "Waikouro", "Waimahaka", "Waimatuku", "Waituna", "Wallacetown", "Waverley", "Winton", "Woodlands", "Woodlaw", "Wyndham"],
  },
};

export interface NzSuburb { id: number; name: string; adjacent: number[]; }
export interface NzDistrict { id: number; name: string; suburbs: NzSuburb[]; }
export interface NzRegion { id: number; name: string; districts: NzDistrict[]; }

export const nzLocations: NzRegion[] = [
  {
    "id": 9,
    "name": "Northland",
    "districts": [
      {
        "id": 1,
        "name": "Far North",
        "suburbs": [
          {
            "id": 2129,
            "name": "Ahipara",
            "adjacent": [
              2129
            ]
          },
          {
            "id": 1590,
            "name": "Awanui",
            "adjacent": [
              1590
            ]
          },
          {
            "id": 3806,
            "name": "Awarua",
            "adjacent": [
              3806
            ]
          },
          {
            "id": 1029,
            "name": "Broadwood",
            "adjacent": [
              1029
            ]
          },
          {
            "id": 1923,
            "name": "Cable Bay",
            "adjacent": [
              1922,
              1923,
              3308,
              1133,
              1950
            ]
          },
          {
            "id": 1499,
            "name": "Cape Reinga",
            "adjacent": [
              1499
            ]
          },
          {
            "id": 3178,
            "name": "Cavalli Islands",
            "adjacent": [
              3178
            ]
          },
          {
            "id": 1950,
            "name": "Coopers Beach",
            "adjacent": [
              1950,
              1923,
              1133
            ]
          },
          {
            "id": 3309,
            "name": "Diggers Valley",
            "adjacent": [
              3309
            ]
          },
          {
            "id": 3310,
            "name": "Fairburn",
            "adjacent": [
              3310
            ]
          },
          {
            "id": 1953,
            "name": "Haruru",
            "adjacent": [
              1953
            ]
          },
          {
            "id": 3179,
            "name": "Henderson Bay",
            "adjacent": [
              3179
            ]
          },
          {
            "id": 1216,
            "name": "Herekino",
            "adjacent": [
              1216
            ]
          },
          {
            "id": 2493,
            "name": "Hihi",
            "adjacent": [
              2493
            ]
          },
          {
            "id": 3180,
            "name": "Hokianga",
            "adjacent": [
              3180
            ]
          },
          {
            "id": 3181,
            "name": "Hokianga Harbour",
            "adjacent": [
              1529,
              3181
            ]
          },
          {
            "id": 2126,
            "name": "Horeke",
            "adjacent": [
              2126
            ]
          },
          {
            "id": 1918,
            "name": "Houhora",
            "adjacent": [
              1918
            ]
          },
          {
            "id": 1855,
            "name": "Kaeo",
            "adjacent": [
              1593,
              1855
            ]
          },
          {
            "id": 1531,
            "name": "Kaikohe",
            "adjacent": [
              1531
            ]
          },
          {
            "id": 3182,
            "name": "Kaimaumau",
            "adjacent": [
              3182
            ]
          },
          {
            "id": 1589,
            "name": "Kaingaroa",
            "adjacent": [
              1589
            ]
          },
          {
            "id": 1591,
            "name": "Kaitaia",
            "adjacent": [
              1591
            ]
          },
          {
            "id": 3183,
            "name": "Karetu",
            "adjacent": [
              3183
            ]
          },
          {
            "id": 2495,
            "name": "Karikari Peninsula",
            "adjacent": [
              2494,
              2495
            ]
          },
          {
            "id": 1526,
            "name": "Kawakawa",
            "adjacent": [
              1526
            ]
          },
          {
            "id": 1736,
            "name": "Kerikeri",
            "adjacent": [
              1736
            ]
          },
          {
            "id": 1960,
            "name": "Kohukohu",
            "adjacent": [
              1960
            ]
          },
          {
            "id": 3313,
            "name": "Koutu ",
            "adjacent": [
              3313
            ]
          },
          {
            "id": 3437,
            "name": "Lake Ohia",
            "adjacent": [
              3437
            ]
          },
          {
            "id": 1959,
            "name": "Mangamuka",
            "adjacent": [
              1959
            ]
          },
          {
            "id": 3412,
            "name": "Mangatoetoe",
            "adjacent": [
              3412
            ]
          },
          {
            "id": 1133,
            "name": "Mangonui",
            "adjacent": [
              1133,
              1923,
              1950
            ]
          },
          {
            "id": 3486,
            "name": "Maromaku",
            "adjacent": [
              3486
            ]
          },
          {
            "id": 3184,
            "name": "Mitimiti",
            "adjacent": [
              3184
            ]
          },
          {
            "id": 1957,
            "name": "Moerewa",
            "adjacent": [
              1957
            ]
          },
          {
            "id": 3413,
            "name": "Motutangi",
            "adjacent": [
              3413
            ]
          },
          {
            "id": 1917,
            "name": "Ngataki",
            "adjacent": [
              1917
            ]
          },
          {
            "id": 1525,
            "name": "Ohaeawai",
            "adjacent": [
              1525
            ]
          },
          {
            "id": 1523,
            "name": "Okaihau",
            "adjacent": [
              1523
            ]
          },
          {
            "id": 3185,
            "name": "Omanaia",
            "adjacent": [
              3185
            ]
          },
          {
            "id": 1530,
            "name": "Omapere",
            "adjacent": [
              1530
            ]
          },
          {
            "id": 2496,
            "name": "Opononi",
            "adjacent": [
              2496
            ]
          },
          {
            "id": 1952,
            "name": "Opua",
            "adjacent": [
              1952
            ]
          },
          {
            "id": 3063,
            "name": "Pakaraka",
            "adjacent": [
              3063
            ]
          },
          {
            "id": 3814,
            "name": "Oue",
            "adjacent": [
              3814,
              3312
            ]
          },
          {
            "id": 1951,
            "name": "Paihia",
            "adjacent": [
              1951
            ]
          },
          {
            "id": 1961,
            "name": "Pamapuria",
            "adjacent": [
              1961
            ]
          },
          {
            "id": 1958,
            "name": "Panguru",
            "adjacent": [
              1958
            ]
          },
          {
            "id": 1135,
            "name": "Paranui",
            "adjacent": [
              1135
            ]
          },
          {
            "id": 1552,
            "name": "Peria",
            "adjacent": [
              1552
            ]
          },
          {
            "id": 1919,
            "name": "Pukenui",
            "adjacent": [
              1919
            ]
          },
          {
            "id": 2125,
            "name": "Pukepoto",
            "adjacent": [
              2125
            ]
          },
          {
            "id": 3186,
            "name": "Rangiahua",
            "adjacent": [
              3186
            ]
          },
          {
            "id": 3239,
            "name": "Rangiputa",
            "adjacent": [
              3239
            ]
          },
          {
            "id": 1529,
            "name": "Rawene",
            "adjacent": [
              1529,
              3181
            ]
          },
          {
            "id": 3639,
            "name": "Rawhiti",
            "adjacent": [
              3639
            ]
          },
          {
            "id": 1527,
            "name": "Russell",
            "adjacent": [
              1527
            ]
          },
          {
            "id": 1528,
            "name": "Taheke",
            "adjacent": [
              1528
            ]
          },
          {
            "id": 1922,
            "name": "Taipa",
            "adjacent": [
              1922,
              1923,
              3308
            ]
          },
          {
            "id": 1215,
            "name": "Takahue",
            "adjacent": [
              1215
            ]
          },
          {
            "id": 1705,
            "name": "Taupo Bay",
            "adjacent": [
              1705
            ]
          },
          {
            "id": 3240,
            "name": "Tauranga Bay",
            "adjacent": [
              3240
            ]
          },
          {
            "id": 2494,
            "name": "Tokerau Beach",
            "adjacent": [
              2494,
              2495
            ]
          },
          {
            "id": 1592,
            "name": "Totara North",
            "adjacent": [
              1592
            ]
          },
          {
            "id": 1192,
            "name": "Towai",
            "adjacent": [
              1192
            ]
          },
          {
            "id": 3719,
            "name": "Umawera",
            "adjacent": [
              3719
            ]
          },
          {
            "id": 1194,
            "name": "Victoria Valley",
            "adjacent": [
              1194
            ]
          },
          {
            "id": 1921,
            "name": "Waiharara",
            "adjacent": [
              1921
            ]
          },
          {
            "id": 3544,
            "name": "Waima",
            "adjacent": [
              3544
            ]
          },
          {
            "id": 3187,
            "name": "Waimamaku",
            "adjacent": [
              3187
            ]
          },
          {
            "id": 3259,
            "name": "Waimate North",
            "adjacent": [
              3259
            ]
          },
          {
            "id": 3745,
            "name": "Waiomio",
            "adjacent": [
              3745
            ]
          },
          {
            "id": 1735,
            "name": "Waipapa",
            "adjacent": [
              1735
            ]
          },
          {
            "id": 3311,
            "name": "Waipapakauri",
            "adjacent": [
              3311
            ]
          },
          {
            "id": 3188,
            "name": "Whangape Harbour",
            "adjacent": [
              3188
            ]
          },
          {
            "id": 1593,
            "name": "Whangaroa",
            "adjacent": [
              1593,
              1855
            ]
          },
          {
            "id": 3436,
            "name": "Whatuwhiwhi",
            "adjacent": [
              3436
            ]
          },
          {
            "id": 3312,
            "name": "Whirinaki ",
            "adjacent": [
              3312,
              3814
            ]
          }
        ]
      },
      {
        "id": 3,
        "name": "Kaipara",
        "suburbs": [
          {
            "id": 1494,
            "name": "Aranga",
            "adjacent": [
              1494
            ]
          },
          {
            "id": 3056,
            "name": "Arapohue",
            "adjacent": [
              3056
            ]
          },
          {
            "id": 3778,
            "name": "Aratapu",
            "adjacent": [
              3778,
              1773
            ]
          },
          {
            "id": 1551,
            "name": "Baylys Beach",
            "adjacent": [
              1551
            ]
          },
          {
            "id": 1862,
            "name": "Dargaville",
            "adjacent": [
              1862
            ]
          },
          {
            "id": 3564,
            "name": "Hakaru",
            "adjacent": [
              3564
            ]
          },
          {
            "id": 3822,
            "name": "Kaihu",
            "adjacent": [
              3822
            ]
          },
          {
            "id": 1571,
            "name": "Kaiwaka",
            "adjacent": [
              1571
            ]
          },
          {
            "id": 934,
            "name": "Kellys Bay",
            "adjacent": [
              934
            ]
          },
          {
            "id": 1453,
            "name": "Mangawhai",
            "adjacent": [
              1453,
              1454,
              1863
            ]
          },
          {
            "id": 1454,
            "name": "Mangawhai Heads",
            "adjacent": [
              1453,
              1454
            ]
          },
          {
            "id": 1863,
            "name": "Mangawhare",
            "adjacent": [
              1453,
              1863
            ]
          },
          {
            "id": 1866,
            "name": "Matakohe",
            "adjacent": [
              1866
            ]
          },
          {
            "id": 1739,
            "name": "Maungaturoto",
            "adjacent": [
              1739
            ]
          },
          {
            "id": 3241,
            "name": "Pahi",
            "adjacent": [
              1867,
              3241
            ]
          },
          {
            "id": 1835,
            "name": "Paparoa",
            "adjacent": [
              1835
            ]
          },
          {
            "id": 1772,
            "name": "Pouto",
            "adjacent": [
              1772
            ]
          },
          {
            "id": 1775,
            "name": "Ruawai",
            "adjacent": [
              1775
            ]
          },
          {
            "id": 1706,
            "name": "Tangiteroria",
            "adjacent": [
              1706
            ]
          },
          {
            "id": 1553,
            "name": "Tangowahine",
            "adjacent": [
              1553
            ]
          },
          {
            "id": 1773,
            "name": "Te Kopuru",
            "adjacent": [
              1773,
              3778
            ]
          },
          {
            "id": 1774,
            "name": "Tinopai",
            "adjacent": [
              1774
            ]
          },
          {
            "id": 3189,
            "name": "Waipoua",
            "adjacent": [
              3189
            ]
          },
          {
            "id": 1867,
            "name": "Whakapirau",
            "adjacent": [
              1867,
              3241
            ]
          }
        ]
      },
      {
        "id": 2,
        "name": "Whangarei",
        "suburbs": [
          {
            "id": 3627,
            "name": "Abbey Caves",
            "adjacent": [
              3627,
              1519,
              1880
            ]
          },
          {
            "id": 3449,
            "name": "Avenues",
            "adjacent": [
              1554,
              1744,
              1444,
              1657,
              1880,
              1883,
              3055,
              3130,
              3435,
              3449,
              3246
            ]
          },
          {
            "id": 1813,
            "name": "Bream Bay",
            "adjacent": [
              1813
            ]
          },
          {
            "id": 3055,
            "name": "Central Whangarei",
            "adjacent": [
              1554,
              1744,
              1444,
              1519,
              1657,
              1880,
              1882,
              1883,
              3055,
              3130,
              3449,
              3246
            ]
          },
          {
            "id": 1420,
            "name": "Glenbervie",
            "adjacent": [
              1442,
              1420
            ]
          },
          {
            "id": 1213,
            "name": "Helena Bay",
            "adjacent": [
              1213
            ]
          },
          {
            "id": 1966,
            "name": "Hikurangi",
            "adjacent": [
              1966
            ]
          },
          {
            "id": 3435,
            "name": "Horahora",
            "adjacent": [
              1744,
              1429,
              1657,
              1881,
              1883,
              3435,
              3449
            ]
          },
          {
            "id": 1963,
            "name": "Hukerenui",
            "adjacent": [
              1963
            ]
          },
          {
            "id": 1424,
            "name": "Kamo",
            "adjacent": [
              1424,
              1441,
              1443
            ]
          },
          {
            "id": 1422,
            "name": "Kauri",
            "adjacent": [
              1879,
              1422
            ]
          },
          {
            "id": 1444,
            "name": "Kensington",
            "adjacent": [
              1441,
              1443,
              1444,
              1880,
              1882,
              1883,
              3055,
              3130,
              3449,
              3246
            ]
          },
          {
            "id": 3190,
            "name": "Kokopu",
            "adjacent": [
              3190
            ]
          },
          {
            "id": 3399,
            "name": "Langs Beach",
            "adjacent": [
              3399
            ]
          },
          {
            "id": 1882,
            "name": "Mairtown",
            "adjacent": [
              1441,
              1442,
              1443,
              1444,
              1880,
              1882,
              3055,
              3130,
              3246
            ]
          },
          {
            "id": 1789,
            "name": "Mangapai",
            "adjacent": [
              1789,
              3140
            ]
          },
          {
            "id": 1791,
            "name": "Marsden Point",
            "adjacent": [
              1791,
              1792
            ]
          },
          {
            "id": 3147,
            "name": "Marua",
            "adjacent": [
              3147
            ]
          },
          {
            "id": 3669,
            "name": "Mata",
            "adjacent": [
              3669
            ]
          },
          {
            "id": 3148,
            "name": "Matapouri",
            "adjacent": [
              3148
            ]
          },
          {
            "id": 3772,
            "name": "Matarau",
            "adjacent": [
              3772,
              3108
            ]
          },
          {
            "id": 1811,
            "name": "Maungakaramea",
            "adjacent": [
              1811
            ]
          },
          {
            "id": 1704,
            "name": "Maungatapere",
            "adjacent": [
              1704
            ]
          },
          {
            "id": 1881,
            "name": "Maunu",
            "adjacent": [
              1744,
              1429,
              1881,
              3435
            ]
          },
          {
            "id": 3247,
            "name": "McLeod Bay",
            "adjacent": [
              3247
            ]
          },
          {
            "id": 1554,
            "name": "Morningside",
            "adjacent": [
              1554,
              1744,
              1429,
              1451,
              1657,
              1880,
              1883,
              3055,
              3449,
              3246
            ]
          },
          {
            "id": 1003,
            "name": "Ngunguru",
            "adjacent": [
              1003
            ]
          },
          {
            "id": 3127,
            "name": "Oakura Coast",
            "adjacent": [
              3127
            ]
          },
          {
            "id": 3140,
            "name": "Oakleigh",
            "adjacent": [
              3140,
              1789
            ]
          },
          {
            "id": 3141,
            "name": "One Tree Point",
            "adjacent": [
              3141
            ]
          },
          {
            "id": 1007,
            "name": "Onerahi",
            "adjacent": [
              1546,
              1555,
              1007,
              3315
            ]
          },
          {
            "id": 3836,
            "name": "Opuawhanga",
            "adjacent": [
              3836
            ]
          },
          {
            "id": 1744,
            "name": "Otaika",
            "adjacent": [
              1554,
              1744,
              1429,
              1451,
              1657,
              1881,
              1883,
              3055,
              3435,
              3449
            ]
          },
          {
            "id": 1443,
            "name": "Otangarei",
            "adjacent": [
              1424,
              1441,
              1442,
              1443,
              1444,
              1882,
              3130
            ]
          },
          {
            "id": 3774,
            "name": "Pakotai",
            "adjacent": [
              3774
            ]
          },
          {
            "id": 1519,
            "name": "Parahaki",
            "adjacent": [
              1519,
              1880,
              3055,
              3246,
              3627
            ]
          },
          {
            "id": 1006,
            "name": "Parua Bay",
            "adjacent": [
              1006
            ]
          },
          {
            "id": 1005,
            "name": "Pataua",
            "adjacent": [
              1005
            ]
          },
          {
            "id": 3142,
            "name": "Pataua North",
            "adjacent": [
              3142
            ]
          },
          {
            "id": 3143,
            "name": "Pataua South",
            "adjacent": [
              3143,
              3775
            ]
          },
          {
            "id": 3656,
            "name": "Pipiwai",
            "adjacent": [
              3656
            ]
          },
          {
            "id": 1575,
            "name": "Poroti",
            "adjacent": [
              1575
            ]
          },
          {
            "id": 1555,
            "name": "Port Whangarei",
            "adjacent": [
              1546,
              1555,
              1007
            ]
          },
          {
            "id": 3130,
            "name": "Regent",
            "adjacent": [
              1441,
              1443,
              1444,
              1657,
              1880,
              1882,
              1883,
              3055,
              3130,
              3449,
              3246
            ]
          },
          {
            "id": 1641,
            "name": "Portland",
            "adjacent": [
              1641
            ]
          },
          {
            "id": 3597,
            "name": "Purua",
            "adjacent": [
              3597
            ]
          },
          {
            "id": 3769,
            "name": "Puwera",
            "adjacent": [
              3769
            ]
          },
          {
            "id": 1429,
            "name": "Raumanga",
            "adjacent": [
              1554,
              1744,
              1429,
              1451,
              1657,
              1881,
              3435
            ]
          },
          {
            "id": 3472,
            "name": "Riponui",
            "adjacent": [
              3472
            ]
          },
          {
            "id": 1880,
            "name": "Riverside",
            "adjacent": [
              1554,
              1444,
              1519,
              1657,
              1880,
              1882,
              1883,
              3055,
              3130,
              3449,
              3246,
              3627
            ]
          },
          {
            "id": 1792,
            "name": "Ruakaka",
            "adjacent": [
              1791,
              1792
            ]
          },
          {
            "id": 3108,
            "name": "Ruatangata",
            "adjacent": [
              3108,
              3772
            ]
          },
          {
            "id": 1546,
            "name": "Sherwood Rise",
            "adjacent": [
              1546,
              1555,
              1007,
              3315
            ]
          },
          {
            "id": 1879,
            "name": "Springs Flat",
            "adjacent": [
              1879,
              1422
            ]
          },
          {
            "id": 3775,
            "name": "Taiharuru",
            "adjacent": [
              3775,
              3143
            ]
          },
          {
            "id": 3767,
            "name": "Taipuha",
            "adjacent": [
              3767
            ]
          },
          {
            "id": 3113,
            "name": "Tamaterau",
            "adjacent": [
              3113
            ]
          },
          {
            "id": 1425,
            "name": "Three Mile Bush",
            "adjacent": [
              1425
            ]
          },
          {
            "id": 1442,
            "name": "Tikipunga",
            "adjacent": [
              1441,
              1442,
              1443,
              1882,
              1420
            ]
          },
          {
            "id": 3191,
            "name": "Titoki",
            "adjacent": [
              3191
            ]
          },
          {
            "id": 1451,
            "name": "Toetoe",
            "adjacent": [
              1554,
              1744,
              1429,
              1451
            ]
          },
          {
            "id": 1967,
            "name": "Tutukaka",
            "adjacent": [
              1967
            ]
          },
          {
            "id": 1883,
            "name": "Vinetown",
            "adjacent": [
              1554,
              1744,
              1444,
              1657,
              1880,
              1883,
              3055,
              3130,
              3435,
              3449,
              3246
            ]
          },
          {
            "id": 3315,
            "name": "Waikaraka",
            "adjacent": [
              1546,
              1007,
              3315
            ]
          },
          {
            "id": 3316,
            "name": "Waikiekie",
            "adjacent": [
              3316
            ]
          },
          {
            "id": 1812,
            "name": "Waiotira",
            "adjacent": [
              1812
            ]
          },
          {
            "id": 1814,
            "name": "Waipu",
            "adjacent": [
              1814,
              1815
            ]
          },
          {
            "id": 1815,
            "name": "Waipu Cove",
            "adjacent": [
              1814,
              1815
            ]
          },
          {
            "id": 1964,
            "name": "Whakapara",
            "adjacent": [
              1964
            ]
          },
          {
            "id": 1002,
            "name": "Whananaki",
            "adjacent": [
              1002
            ]
          },
          {
            "id": 3246,
            "name": "Whangarei",
            "adjacent": [
              1554,
              1444,
              1519,
              1657,
              1880,
              1882,
              1883,
              3055,
              3130,
              3449,
              3246
            ]
          },
          {
            "id": 1642,
            "name": "Whangarei Heads",
            "adjacent": [
              1642
            ]
          },
          {
            "id": 1954,
            "name": "Whangaruru",
            "adjacent": [
              1954
            ]
          },
          {
            "id": 1419,
            "name": "Whareora",
            "adjacent": [
              1419
            ]
          },
          {
            "id": 1640,
            "name": "Whatitiri",
            "adjacent": [
              1640,
              3441
            ]
          },
          {
            "id": 1441,
            "name": "Whau Valley",
            "adjacent": [
              1424,
              1441,
              1442,
              1443,
              1444,
              1882,
              3130
            ]
          },
          {
            "id": 3441,
            "name": "Wheki Valley",
            "adjacent": [
              1640,
              3441
            ]
          },
          {
            "id": 1657,
            "name": "Woodhill",
            "adjacent": [
              1554,
              1744,
              1429,
              1657,
              1880,
              1883,
              3055,
              3130,
              3435,
              3449,
              3246
            ]
          }
        ]
      }
    ]
  },
  {
    "id": 1,
    "name": "Auckland",
    "districts": [
      {
        "id": 7,
        "name": "Auckland City",
        "suburbs": [
          {
            "id": 3256,
            "name": "Arch Hill",
            "adjacent": [
              82,
              83,
              86,
              87,
              88,
              89,
              91,
              3256,
              123,
              124,
              126,
              135,
              136
            ]
          },
          {
            "id": 149,
            "name": "Avondale",
            "adjacent": [
              147,
              149,
              307,
              3167,
              142
            ]
          },
          {
            "id": 124,
            "name": "Balmoral",
            "adjacent": [
              86,
              90,
              3256,
              3258,
              123,
              124,
              125,
              126,
              128,
              135
            ]
          },
          {
            "id": 130,
            "name": "Blockhouse Bay",
            "adjacent": [
              102,
              130
            ]
          },
          {
            "id": 89,
            "name": "City Centre",
            "adjacent": [
              41,
              82,
              83,
              88,
              89,
              91,
              99,
              3256,
              135,
              136,
              3566
            ]
          },
          {
            "id": 3229,
            "name": "Coxs Bay",
            "adjacent": [
              83,
              84,
              85,
              87,
              109,
              3229
            ]
          },
          {
            "id": 135,
            "name": "Eden Terrace",
            "adjacent": [
              82,
              83,
              87,
              88,
              89,
              90,
              99,
              3256,
              123,
              124,
              126,
              135,
              136
            ]
          },
          {
            "id": 393,
            "name": "Ellerslie",
            "adjacent": [
              63,
              148,
              122,
              393,
              3496,
              290,
              315
            ]
          },
          {
            "id": 125,
            "name": "Epsom",
            "adjacent": [
              90,
              99,
              122,
              124,
              125,
              131,
              132
            ]
          },
          {
            "id": 88,
            "name": "Freemans Bay",
            "adjacent": [
              82,
              83,
              84,
              87,
              88,
              89,
              91,
              109,
              3256,
              123,
              135,
              136,
              3566
            ]
          },
          {
            "id": 316,
            "name": "Glen Innes",
            "adjacent": [
              16,
              17,
              42,
              61,
              316,
              317,
              337
            ]
          },
          {
            "id": 16,
            "name": "Glendowie",
            "adjacent": [
              16,
              42,
              316,
              317
            ]
          },
          {
            "id": 136,
            "name": "Grafton",
            "adjacent": [
              41,
              82,
              88,
              89,
              90,
              99,
              3256,
              123,
              135,
              136
            ]
          },
          {
            "id": 122,
            "name": "Greenlane",
            "adjacent": [
              40,
              148,
              122,
              125,
              131,
              393
            ]
          },
          {
            "id": 87,
            "name": "Grey Lynn",
            "adjacent": [
              82,
              83,
              84,
              86,
              87,
              88,
              91,
              109,
              3256,
              3229,
              123,
              126,
              135
            ]
          },
          {
            "id": 84,
            "name": "Herne Bay",
            "adjacent": [
              83,
              84,
              87,
              88,
              91,
              109,
              3229
            ]
          },
          {
            "id": 138,
            "name": "Hillsborough",
            "adjacent": [
              146,
              120,
              121,
              132,
              138,
              141
            ]
          },
          {
            "id": 123,
            "name": "Kingsland",
            "adjacent": [
              82,
              86,
              87,
              88,
              90,
              3256,
              3258,
              123,
              124,
              126,
              135,
              136,
              128,
              129
            ]
          },
          {
            "id": 17,
            "name": "Kohimarama",
            "adjacent": [
              17,
              39,
              42,
              61,
              62,
              316
            ]
          },
          {
            "id": 102,
            "name": "Lynfield",
            "adjacent": [
              102,
              146,
              3167,
              120,
              127,
              130
            ]
          },
          {
            "id": 39,
            "name": "Meadowbank",
            "adjacent": [
              17,
              39,
              61,
              62,
              63,
              322,
              3496,
              40
            ]
          },
          {
            "id": 62,
            "name": "Mission Bay",
            "adjacent": [
              17,
              39,
              61,
              62,
              322
            ]
          },
          {
            "id": 126,
            "name": "Morningside",
            "adjacent": [
              86,
              87,
              3256,
              3258,
              123,
              124,
              126,
              128,
              129,
              135
            ]
          },
          {
            "id": 129,
            "name": "Mount Albert",
            "adjacent": [
              85,
              86,
              147,
              3167,
              3258,
              126,
              128,
              129,
              142,
              123
            ]
          },
          {
            "id": 90,
            "name": "Mount Eden",
            "adjacent": [
              90,
              99,
              123,
              124,
              125,
              131,
              135,
              136,
              121
            ]
          },
          {
            "id": 120,
            "name": "Mount Roskill",
            "adjacent": [
              102,
              146,
              120,
              127,
              138,
              128,
              121
            ]
          },
          {
            "id": 315,
            "name": "Mount Wellington",
            "adjacent": [
              288,
              315,
              338,
              393
            ]
          },
          {
            "id": 3167,
            "name": "New Windsor",
            "adjacent": [
              102,
              147,
              149,
              3167,
              127,
              128,
              129
            ]
          },
          {
            "id": 99,
            "name": "Newmarket",
            "adjacent": [
              40,
              41,
              82,
              89,
              90,
              99,
              125,
              135,
              136
            ]
          },
          {
            "id": 82,
            "name": "Newton",
            "adjacent": [
              82,
              83,
              87,
              88,
              89,
              91,
              99,
              3256,
              123,
              135,
              136
            ]
          },
          {
            "id": 131,
            "name": "One Tree Hill",
            "adjacent": [
              90,
              121,
              122,
              125,
              131,
              132,
              141
            ]
          },
          {
            "id": 141,
            "name": "Onehunga",
            "adjacent": [
              148,
              132,
              141,
              395,
              338,
              138,
              131
            ]
          },
          {
            "id": 322,
            "name": "Orakei",
            "adjacent": [
              39,
              62,
              322
            ]
          },
          {
            "id": 148,
            "name": "Oranga",
            "adjacent": [
              148,
              290,
              122,
              141,
              393,
              395
            ]
          },
          {
            "id": 338,
            "name": "Otahuhu",
            "adjacent": [
              338,
              315,
              141
            ]
          },
          {
            "id": 147,
            "name": "Owairaka",
            "adjacent": [
              147,
              149,
              3167,
              3258,
              127,
              128,
              129
            ]
          },
          {
            "id": 288,
            "name": "Panmure",
            "adjacent": [
              288,
              315,
              336,
              337,
              394,
              3496
            ]
          },
          {
            "id": 41,
            "name": "Parnell",
            "adjacent": [
              41,
              89,
              99,
              136
            ]
          },
          {
            "id": 290,
            "name": "Penrose",
            "adjacent": [
              148,
              290,
              395,
              393
            ]
          },
          {
            "id": 85,
            "name": "Point Chevalier",
            "adjacent": [
              85,
              86,
              109,
              3229,
              129,
              142
            ]
          },
          {
            "id": 337,
            "name": "Point England",
            "adjacent": [
              61,
              288,
              316,
              317,
              337,
              394,
              3496
            ]
          },
          {
            "id": 83,
            "name": "Ponsonby",
            "adjacent": [
              82,
              83,
              84,
              87,
              88,
              89,
              91,
              109,
              3256,
              3229,
              135
            ]
          },
          {
            "id": 40,
            "name": "Remuera",
            "adjacent": [
              40,
              99,
              122,
              39
            ]
          },
          {
            "id": 132,
            "name": "Royal Oak",
            "adjacent": [
              121,
              125,
              131,
              132,
              138,
              141
            ]
          },
          {
            "id": 42,
            "name": "Saint Heliers",
            "adjacent": [
              16,
              17,
              42,
              316
            ]
          },
          {
            "id": 61,
            "name": "Saint Johns",
            "adjacent": [
              17,
              39,
              61,
              62,
              63,
              316,
              337,
              3496
            ]
          },
          {
            "id": 63,
            "name": "Saint Johns Park",
            "adjacent": [
              39,
              61,
              63,
              393,
              3496
            ]
          },
          {
            "id": 91,
            "name": "Saint Marys Bay",
            "adjacent": [
              82,
              83,
              84,
              87,
              88,
              89,
              91,
              3256,
              3566
            ]
          },
          {
            "id": 128,
            "name": "Sandringham",
            "adjacent": [
              86,
              147,
              3167,
              3258,
              121,
              124,
              126,
              127,
              128,
              129,
              123,
              120
            ]
          },
          {
            "id": 3258,
            "name": "St Lukes",
            "adjacent": [
              86,
              147,
              3258,
              123,
              124,
              126,
              128,
              129
            ]
          },
          {
            "id": 3496,
            "name": "Stonefields",
            "adjacent": [
              39,
              61,
              63,
              288,
              337,
              393,
              394,
              3496
            ]
          },
          {
            "id": 394,
            "name": "Tamaki",
            "adjacent": [
              286,
              288,
              336,
              337,
              394,
              3496
            ]
          },
          {
            "id": 395,
            "name": "Te Papapa",
            "adjacent": [
              148,
              290,
              141,
              395
            ]
          },
          {
            "id": 121,
            "name": "Three Kings",
            "adjacent": [
              121,
              127,
              128,
              131,
              132,
              138,
              90,
              120
            ]
          },
          {
            "id": 317,
            "name": "Wai O Taiki Bay",
            "adjacent": [
              16,
              316,
              317,
              337
            ]
          },
          {
            "id": 146,
            "name": "Waikowhai",
            "adjacent": [
              102,
              146,
              120,
              138
            ]
          },
          {
            "id": 142,
            "name": "Waterview",
            "adjacent": [
              85,
              129,
              142,
              149
            ]
          },
          {
            "id": 127,
            "name": "Wesley",
            "adjacent": [
              102,
              147,
              3167,
              120,
              121,
              127,
              128
            ]
          },
          {
            "id": 86,
            "name": "Western Springs",
            "adjacent": [
              85,
              86,
              87,
              109,
              3256,
              3258,
              123,
              124,
              126,
              128,
              129
            ]
          },
          {
            "id": 109,
            "name": "Westmere",
            "adjacent": [
              83,
              84,
              85,
              86,
              87,
              88,
              109,
              3229
            ]
          },
          {
            "id": 3566,
            "name": "Wynyard Quarter",
            "adjacent": [
              3566,
              89,
              88,
              91
            ]
          }
        ]
      },
      {
        "id": 10,
        "name": "Franklin",
        "suburbs": [
          {
            "id": 1188,
            "name": "Aka Aka",
            "adjacent": [
              1188
            ]
          },
          {
            "id": 346,
            "name": "Ararimu",
            "adjacent": [
              346
            ]
          },
          {
            "id": 293,
            "name": "Awhitu",
            "adjacent": [
              293,
              3599
            ]
          },
          {
            "id": 2851,
            "name": "Bombay",
            "adjacent": [
              330,
              2851,
              1082
            ]
          },
          {
            "id": 865,
            "name": "Buckland",
            "adjacent": [
              302,
              2848,
              865
            ]
          },
          {
            "id": 173,
            "name": "Clarks Beach",
            "adjacent": [
              173,
              181
            ]
          },
          {
            "id": 283,
            "name": "Glenbrook",
            "adjacent": [
              283
            ]
          },
          {
            "id": 988,
            "name": "Harrisville",
            "adjacent": [
              988
            ]
          },
          {
            "id": 345,
            "name": "Hunua",
            "adjacent": [
              345,
              1082
            ]
          },
          {
            "id": 1082,
            "name": "Kaiaua",
            "adjacent": [
              1082,
              1372,
              3555,
              345,
              66,
              2851,
              1114,
              1081
            ]
          },
          {
            "id": 66,
            "name": "Karaka",
            "adjacent": [
              66,
              1082
            ]
          },
          {
            "id": 3529,
            "name": "Karaka Harbourside",
            "adjacent": [
              3529
            ]
          },
          {
            "id": 67,
            "name": "Kingseat",
            "adjacent": [
              67
            ]
          },
          {
            "id": 1372,
            "name": "Mangatangi",
            "adjacent": [
              1372,
              1082
            ]
          },
          {
            "id": 1114,
            "name": "Mangatawhiri",
            "adjacent": [
              1114,
              1082
            ]
          },
          {
            "id": 3599,
            "name": "Manukau Heads",
            "adjacent": [
              3599,
              293
            ]
          },
          {
            "id": 1375,
            "name": "Maramarua",
            "adjacent": [
              1375
            ]
          },
          {
            "id": 382,
            "name": "Mauku",
            "adjacent": [
              382,
              383
            ]
          },
          {
            "id": 867,
            "name": "Mercer",
            "adjacent": [
              867
            ]
          },
          {
            "id": 659,
            "name": "Onewhero",
            "adjacent": [
              659
            ]
          },
          {
            "id": 1209,
            "name": "Otaua",
            "adjacent": [
              1209
            ]
          },
          {
            "id": 68,
            "name": "Paerata",
            "adjacent": [
              68
            ]
          },
          {
            "id": 2853,
            "name": "Paparimu",
            "adjacent": [
              2853
            ]
          },
          {
            "id": 383,
            "name": "Patumahoe",
            "adjacent": [
              382,
              383
            ]
          },
          {
            "id": 2849,
            "name": "Pokeno",
            "adjacent": [
              2849
            ]
          },
          {
            "id": 134,
            "name": "Pollok",
            "adjacent": [
              134
            ]
          },
          {
            "id": 1081,
            "name": "Port Waikato",
            "adjacent": [
              1081,
              1082
            ]
          },
          {
            "id": 660,
            "name": "Pukekawa",
            "adjacent": [
              660
            ]
          },
          {
            "id": 302,
            "name": "Pukekohe",
            "adjacent": [
              302,
              2848,
              865
            ]
          },
          {
            "id": 2848,
            "name": "Pukekohe East",
            "adjacent": [
              302,
              2848,
              865
            ]
          },
          {
            "id": 871,
            "name": "Puni",
            "adjacent": [
              871
            ]
          },
          {
            "id": 330,
            "name": "Ramarama",
            "adjacent": [
              330,
              2851
            ]
          },
          {
            "id": 658,
            "name": "Te Kohanga",
            "adjacent": [
              658
            ]
          },
          {
            "id": 866,
            "name": "Tuakau",
            "adjacent": [
              866
            ]
          },
          {
            "id": 181,
            "name": "Waiau Pa",
            "adjacent": [
              173,
              181
            ]
          },
          {
            "id": 3591,
            "name": "Waikaretu",
            "adjacent": [
              3591
            ]
          },
          {
            "id": 175,
            "name": "Waiuku",
            "adjacent": [
              175
            ]
          },
          {
            "id": 3555,
            "name": "Whakatiwai",
            "adjacent": [
              3555,
              348,
              1082
            ]
          },
          {
            "id": 348,
            "name": "Wharekawa",
            "adjacent": [
              348,
              3555
            ]
          }
        ]
      },
      {
        "id": 81,
        "name": "Hauraki Gulf Islands",
        "suburbs": [
          {
            "id": 381,
            "name": "Great Barrier Island",
            "adjacent": [
              381
            ]
          },
          {
            "id": 3125,
            "name": "Kawau Island",
            "adjacent": [
              3125
            ]
          },
          {
            "id": 3060,
            "name": "Rakino Island",
            "adjacent": [
              3060
            ]
          }
        ]
      },
      {
        "id": 8,
        "name": "Manukau City",
        "suburbs": [
          {
            "id": 390,
            "name": "Alfriston",
            "adjacent": [
              390
            ]
          },
          {
            "id": 26,
            "name": "Beachlands",
            "adjacent": [
              26
            ]
          },
          {
            "id": 15,
            "name": "Botany Downs",
            "adjacent": [
              6,
              13,
              14,
              15,
              24,
              27,
              28,
              29,
              258,
              3414,
              3479,
              3541
            ]
          },
          {
            "id": 10,
            "name": "Brookby",
            "adjacent": [
              10,
              9,
              11
            ]
          },
          {
            "id": 18,
            "name": "Bucklands Beach",
            "adjacent": [
              2,
              3,
              18,
              252,
              253
            ]
          },
          {
            "id": 258,
            "name": "Burswood",
            "adjacent": [
              13,
              14,
              15,
              29,
              258,
              3541
            ]
          },
          {
            "id": 335,
            "name": "Chapel Downs",
            "adjacent": [
              273,
              298,
              299,
              300,
              335,
              369
            ]
          },
          {
            "id": 368,
            "name": "City Centre",
            "adjacent": [
              298,
              300,
              363,
              364,
              3146,
              3205,
              368,
              369
            ]
          },
          {
            "id": 365,
            "name": "Clendon Park",
            "adjacent": [
              365,
              366
            ]
          },
          {
            "id": 11,
            "name": "Clevedon",
            "adjacent": [
              11,
              10
            ]
          },
          {
            "id": 369,
            "name": "Clover Park",
            "adjacent": [
              273,
              298,
              299,
              300,
              335,
              3146,
              3205,
              368,
              369
            ]
          },
          {
            "id": 4,
            "name": "Cockle Bay",
            "adjacent": [
              3,
              4,
              27,
              28,
              3414,
              3488,
              2
            ]
          },
          {
            "id": 29,
            "name": "Cumbria Downs",
            "adjacent": [
              13,
              14,
              15,
              24,
              27,
              28,
              29,
              258,
              3414,
              3479,
              3490
            ]
          },
          {
            "id": 24,
            "name": "Dannemora",
            "adjacent": [
              13,
              14,
              15,
              24,
              27,
              28,
              29,
              3414,
              3479,
              3490
            ]
          },
          {
            "id": 5,
            "name": "East Tamaki",
            "adjacent": [
              5,
              254
            ]
          },
          {
            "id": 3490,
            "name": "East Tamaki Heights",
            "adjacent": [
              14,
              23,
              24,
              29,
              3490
            ]
          },
          {
            "id": 253,
            "name": "Eastern Beach",
            "adjacent": [
              2,
              3,
              18,
              252,
              253
            ]
          },
          {
            "id": 286,
            "name": "Farm Cove",
            "adjacent": [
              25,
              252,
              286,
              336,
              394,
              3541
            ]
          },
          {
            "id": 318,
            "name": "Favona",
            "adjacent": [
              32,
              269,
              318
            ]
          },
          {
            "id": 273,
            "name": "Flat Bush",
            "adjacent": [
              273,
              298,
              299,
              335,
              369
            ]
          },
          {
            "id": 13,
            "name": "Golflands",
            "adjacent": [
              6,
              13,
              14,
              15,
              24,
              29,
              258,
              3414,
              3479,
              3541
            ]
          },
          {
            "id": 298,
            "name": "Goodwood Heights",
            "adjacent": [
              273,
              298,
              299,
              300,
              334,
              335,
              3146,
              3205,
              368,
              369,
              3586
            ]
          },
          {
            "id": 252,
            "name": "Half Moon Bay",
            "adjacent": [
              2,
              6,
              18,
              25,
              252,
              253,
              286
            ]
          },
          {
            "id": 6,
            "name": "Highland Park",
            "adjacent": [
              2,
              6,
              13,
              15,
              25,
              252,
              3414,
              3541
            ]
          },
          {
            "id": 391,
            "name": "Hill Park",
            "adjacent": [
              300,
              301,
              333,
              334,
              363,
              391,
              392
            ]
          },
          {
            "id": 2,
            "name": "Howick",
            "adjacent": [
              2,
              3,
              6,
              18,
              252,
              253,
              3414,
              4
            ]
          },
          {
            "id": 14,
            "name": "Huntington Park",
            "adjacent": [
              13,
              14,
              15,
              23,
              24,
              29,
              258,
              3490,
              3541
            ]
          },
          {
            "id": 33,
            "name": "Kawakawa Bay",
            "adjacent": [
              33
            ]
          },
          {
            "id": 3146,
            "name": "Mahia Park",
            "adjacent": [
              298,
              300,
              363,
              364,
              3146,
              3205,
              368,
              369
            ]
          },
          {
            "id": 32,
            "name": "Mangere",
            "adjacent": [
              32,
              269,
              318
            ]
          },
          {
            "id": 30,
            "name": "Mangere Bridge",
            "adjacent": [
              30
            ]
          },
          {
            "id": 269,
            "name": "Mangere East",
            "adjacent": [
              32,
              269,
              318
            ]
          },
          {
            "id": 3205,
            "name": "Manukau",
            "adjacent": [
              298,
              300,
              363,
              364,
              3146,
              3205,
              368,
              369
            ]
          },
          {
            "id": 299,
            "name": "Manukau Heights",
            "adjacent": [
              273,
              298,
              299,
              300,
              335,
              369,
              3586
            ]
          },
          {
            "id": 333,
            "name": "Manurewa",
            "adjacent": [
              301,
              333,
              334,
              391,
              392
            ]
          },
          {
            "id": 301,
            "name": "Manurewa East",
            "adjacent": [
              301,
              333,
              334,
              391,
              392
            ]
          },
          {
            "id": 8,
            "name": "Maraetai",
            "adjacent": [
              8,
              20
            ]
          },
          {
            "id": 36,
            "name": "Matingarahi",
            "adjacent": [
              36
            ]
          },
          {
            "id": 3414,
            "name": "Meadowlands",
            "adjacent": [
              2,
              4,
              6,
              13,
              15,
              24,
              27,
              28,
              29,
              3414,
              3479,
              3488
            ]
          },
          {
            "id": 3,
            "name": "Mellons Bay",
            "adjacent": [
              2,
              3,
              4,
              18,
              253
            ]
          },
          {
            "id": 3506,
            "name": "Mission Heights",
            "adjacent": [
              23,
              3506
            ]
          },
          {
            "id": 28,
            "name": "Northpark",
            "adjacent": [
              4,
              15,
              24,
              27,
              28,
              29,
              3414,
              3479,
              3488
            ]
          },
          {
            "id": 20,
            "name": "Omana Beach",
            "adjacent": [
              8,
              20
            ]
          },
          {
            "id": 34,
            "name": "Orere",
            "adjacent": [
              34,
              35
            ]
          },
          {
            "id": 35,
            "name": "Orere Point",
            "adjacent": [
              34,
              35
            ]
          },
          {
            "id": 254,
            "name": "Otara",
            "adjacent": [
              5,
              254
            ]
          },
          {
            "id": 25,
            "name": "Pakuranga",
            "adjacent": [
              6,
              25,
              252,
              286,
              336,
              3541
            ]
          },
          {
            "id": 3541,
            "name": "Pakuranga Heights",
            "adjacent": [
              3541,
              15,
              258,
              286,
              13,
              6,
              14,
              25,
              336
            ]
          },
          {
            "id": 240,
            "name": "Papatoetoe",
            "adjacent": [
              240,
              364
            ]
          },
          {
            "id": 23,
            "name": "Point View Park",
            "adjacent": [
              14,
              23,
              3490,
              3506
            ]
          },
          {
            "id": 364,
            "name": "Puhinui",
            "adjacent": [
              240,
              364,
              3146,
              3205,
              368
            ]
          },
          {
            "id": 392,
            "name": "Randwick Park",
            "adjacent": [
              301,
              333,
              334,
              391,
              392
            ]
          },
          {
            "id": 3479,
            "name": "Shamrock Park",
            "adjacent": [
              13,
              15,
              24,
              27,
              28,
              29,
              3414,
              3479,
              3488
            ]
          },
          {
            "id": 3488,
            "name": "Shelly Park",
            "adjacent": [
              4,
              27,
              28,
              3414,
              3479,
              3488
            ]
          },
          {
            "id": 27,
            "name": "Somerville",
            "adjacent": [
              4,
              15,
              24,
              27,
              28,
              29,
              3414,
              3479,
              3488
            ]
          },
          {
            "id": 336,
            "name": "Sunnyhills",
            "adjacent": [
              25,
              286,
              288,
              336,
              394,
              3541
            ]
          },
          {
            "id": 334,
            "name": "The Gardens",
            "adjacent": [
              298,
              300,
              301,
              333,
              334,
              391,
              392,
              3586
            ]
          },
          {
            "id": 300,
            "name": "Totara Heights",
            "adjacent": [
              298,
              299,
              300,
              334,
              335,
              363,
              3146,
              3205,
              368,
              369,
              391,
              3586
            ]
          },
          {
            "id": 3586,
            "name": "Totara Park",
            "adjacent": [
              3586,
              298,
              299,
              334,
              300
            ]
          },
          {
            "id": 367,
            "name": "Wattle Downs",
            "adjacent": [
              2636,
              367
            ]
          },
          {
            "id": 366,
            "name": "Weymouth",
            "adjacent": [
              365,
              366
            ]
          },
          {
            "id": 9,
            "name": "Whitford",
            "adjacent": [
              9,
              10
            ]
          },
          {
            "id": 363,
            "name": "Wiri",
            "adjacent": [
              300,
              363,
              3146,
              3205,
              368,
              391
            ]
          }
        ]
      },
      {
        "id": 5,
        "name": "North Shore City",
        "suburbs": [
          {
            "id": 139,
            "name": "Albany",
            "adjacent": [
              3275,
              139,
              140,
              3272,
              92,
              114
            ]
          },
          {
            "id": 2982,
            "name": "Bayswater",
            "adjacent": [
              37,
              49,
              60,
              74,
              3262,
              2982
            ]
          },
          {
            "id": 3233,
            "name": "Bayview",
            "adjacent": [
              52,
              156,
              3003,
              3233,
              114,
              116
            ]
          },
          {
            "id": 3005,
            "name": "Beach Haven",
            "adjacent": [
              54,
              3005
            ]
          },
          {
            "id": 37,
            "name": "Belmont",
            "adjacent": [
              37,
              49,
              74,
              3262,
              2982
            ]
          },
          {
            "id": 54,
            "name": "Birkdale",
            "adjacent": [
              54,
              56,
              104,
              3005
            ]
          },
          {
            "id": 55,
            "name": "Birkenhead",
            "adjacent": [
              55,
              56,
              104,
              105,
              3263
            ]
          },
          {
            "id": 93,
            "name": "Browns Bay",
            "adjacent": [
              76,
              81,
              93,
              94,
              95,
              111,
              3275,
              118,
              3608
            ]
          },
          {
            "id": 97,
            "name": "Campbells Bay",
            "adjacent": [
              95,
              96,
              97,
              110,
              154,
              155,
              118,
              119,
              3473
            ]
          },
          {
            "id": 154,
            "name": "Castor Bay",
            "adjacent": [
              50,
              53,
              57,
              96,
              97,
              110,
              154,
              155
            ]
          },
          {
            "id": 104,
            "name": "Chatswood",
            "adjacent": [
              54,
              55,
              104
            ]
          },
          {
            "id": 116,
            "name": "Chester Park",
            "adjacent": [
              51,
              156,
              3272,
              3233,
              114,
              115,
              116,
              140
            ]
          },
          {
            "id": 155,
            "name": "Crown Hill",
            "adjacent": [
              50,
              53,
              57,
              97,
              110,
              154,
              155,
              3451
            ]
          },
          {
            "id": 60,
            "name": "Devonport",
            "adjacent": [
              49,
              60,
              3262,
              2982
            ]
          },
          {
            "id": 3674,
            "name": "Fairview Heights",
            "adjacent": [
              3674,
              3230,
              111,
              3275,
              3265
            ]
          },
          {
            "id": 50,
            "name": "Forrest Hill",
            "adjacent": [
              50,
              53,
              57,
              110,
              154,
              155,
              3451,
              3235
            ]
          },
          {
            "id": 3003,
            "name": "Glenfield",
            "adjacent": [
              52,
              56,
              105,
              3451,
              3003,
              3233,
              114
            ]
          },
          {
            "id": 3608,
            "name": "Glenvar",
            "adjacent": [
              3608,
              93,
              77,
              76,
              81
            ]
          },
          {
            "id": 51,
            "name": "Greenhithe",
            "adjacent": [
              51,
              156,
              3272,
              116,
              114
            ]
          },
          {
            "id": 74,
            "name": "Hauraki",
            "adjacent": [
              37,
              74,
              404,
              3262,
              2982
            ]
          },
          {
            "id": 105,
            "name": "Hillcrest",
            "adjacent": [
              52,
              55,
              56,
              57,
              105,
              3003
            ]
          },
          {
            "id": 77,
            "name": "Long Bay",
            "adjacent": [
              76,
              77,
              81,
              3608
            ]
          },
          {
            "id": 3228,
            "name": "Lucas Heights",
            "adjacent": [
              3265,
              3228
            ]
          },
          {
            "id": 96,
            "name": "Mairangi Bay",
            "adjacent": [
              94,
              95,
              96,
              97,
              110,
              154,
              118,
              119,
              3473
            ]
          },
          {
            "id": 52,
            "name": "Marlborough",
            "adjacent": [
              52,
              56,
              105,
              3451,
              3003,
              3233
            ]
          },
          {
            "id": 115,
            "name": "Meadowood",
            "adjacent": [
              110,
              3451,
              3235,
              114,
              115,
              116,
              119,
              140,
              3473
            ]
          },
          {
            "id": 53,
            "name": "Milford",
            "adjacent": [
              50,
              53,
              57,
              154,
              155,
              404
            ]
          },
          {
            "id": 95,
            "name": "Murrays Bay",
            "adjacent": [
              93,
              94,
              95,
              96,
              97,
              111,
              118,
              119,
              3473
            ]
          },
          {
            "id": 3262,
            "name": "Narrow Neck",
            "adjacent": [
              37,
              49,
              60,
              74,
              3262,
              2982
            ]
          },
          {
            "id": 140,
            "name": "North Harbour",
            "adjacent": [
              3272,
              114,
              115,
              116,
              139,
              140
            ]
          },
          {
            "id": 56,
            "name": "Northcote",
            "adjacent": [
              52,
              54,
              55,
              56,
              105,
              3003
            ]
          },
          {
            "id": 3263,
            "name": "Northcote Point",
            "adjacent": [
              55,
              3263
            ]
          },
          {
            "id": 111,
            "name": "Northcross",
            "adjacent": [
              81,
              93,
              94,
              95,
              111,
              3275,
              3230,
              118,
              3674
            ]
          },
          {
            "id": 75,
            "name": "Okura",
            "adjacent": [
              75,
              226,
              3648
            ]
          },
          {
            "id": 3275,
            "name": "Oteha",
            "adjacent": [
              93,
              94,
              111,
              3275,
              3230,
              139,
              3674
            ]
          },
          {
            "id": 92,
            "name": "Paremoremo",
            "adjacent": [
              92,
              3272,
              139
            ]
          },
          {
            "id": 118,
            "name": "Pinehill",
            "adjacent": [
              93,
              94,
              95,
              96,
              97,
              110,
              111,
              118,
              119,
              3473
            ]
          },
          {
            "id": 3473,
            "name": "Rosedale",
            "adjacent": [
              95,
              96,
              97,
              110,
              3235,
              115,
              118,
              119,
              3473
            ]
          },
          {
            "id": 94,
            "name": "Rothesay Bay",
            "adjacent": [
              81,
              93,
              94,
              95,
              96,
              111,
              3275,
              118,
              119
            ]
          },
          {
            "id": 3272,
            "name": "Schnapper Rock",
            "adjacent": [
              51,
              92,
              156,
              3272,
              116,
              140,
              139
            ]
          },
          {
            "id": 49,
            "name": "Stanley Bay",
            "adjacent": [
              37,
              49,
              60,
              3262,
              2982
            ]
          },
          {
            "id": 110,
            "name": "Sunnynook",
            "adjacent": [
              50,
              96,
              97,
              110,
              154,
              155,
              3451,
              3235,
              115,
              118,
              119,
              3473
            ]
          },
          {
            "id": 404,
            "name": "Takapuna",
            "adjacent": [
              53,
              57,
              74,
              404
            ]
          },
          {
            "id": 76,
            "name": "Torbay",
            "adjacent": [
              76,
              77,
              81,
              93,
              3608
            ]
          },
          {
            "id": 3235,
            "name": "Totara Vale",
            "adjacent": [
              50,
              110,
              3451,
              3235,
              114,
              115,
              119,
              3473
            ]
          },
          {
            "id": 114,
            "name": "Unsworth Heights",
            "adjacent": [
              3233,
              3235,
              114,
              115,
              116,
              140,
              3003,
              139,
              51
            ]
          },
          {
            "id": 81,
            "name": "Waiake",
            "adjacent": [
              76,
              77,
              81,
              93,
              94,
              111,
              3608
            ]
          },
          {
            "id": 156,
            "name": "Wainoni",
            "adjacent": [
              51,
              156,
              3272,
              3233,
              116
            ]
          },
          {
            "id": 3451,
            "name": "Wairau Valley",
            "adjacent": [
              50,
              52,
              57,
              110,
              155,
              3451,
              3003,
              3235,
              115
            ]
          },
          {
            "id": 57,
            "name": "Westlake",
            "adjacent": [
              50,
              53,
              57,
              105,
              154,
              155,
              404,
              3451
            ]
          },
          {
            "id": 119,
            "name": "Windsor Park",
            "adjacent": [
              94,
              95,
              96,
              97,
              110,
              3235,
              115,
              118,
              119,
              3473
            ]
          }
        ]
      },
      {
        "id": 9,
        "name": "Papakura",
        "suburbs": [
          {
            "id": 389,
            "name": "Ardmore",
            "adjacent": [
              389
            ]
          },
          {
            "id": 2636,
            "name": "Conifer Grove",
            "adjacent": [
              2510,
              2636,
              367
            ]
          },
          {
            "id": 2509,
            "name": "Drury",
            "adjacent": [
              2509,
              371,
              3592
            ]
          },
          {
            "id": 371,
            "name": "Opaheke",
            "adjacent": [
              2509,
              371
            ]
          },
          {
            "id": 461,
            "name": "Pahurehure",
            "adjacent": [
              2521,
              461,
              3545
            ]
          },
          {
            "id": 2521,
            "name": "Papakura",
            "adjacent": [
              2521,
              461,
              372,
              3545
            ]
          },
          {
            "id": 372,
            "name": "Red Hill",
            "adjacent": [
              2521,
              372
            ]
          },
          {
            "id": 3545,
            "name": "Rosehill",
            "adjacent": [
              3545,
              461,
              2521
            ]
          },
          {
            "id": 3592,
            "name": "Runciman",
            "adjacent": [
              3592,
              2509
            ]
          },
          {
            "id": 2510,
            "name": "Takanini",
            "adjacent": [
              2510,
              2636
            ]
          }
        ]
      },
      {
        "id": 4,
        "name": "Rodney",
        "suburbs": [
          {
            "id": 202,
            "name": "Ahuroa",
            "adjacent": [
              202
            ]
          },
          {
            "id": 3265,
            "name": "Albany Heights",
            "adjacent": [
              3265,
              3228,
              3230,
              206,
              247,
              3674
            ]
          },
          {
            "id": 235,
            "name": "Algies Bay",
            "adjacent": [
              280,
              235
            ]
          },
          {
            "id": 320,
            "name": "Arkles Bay",
            "adjacent": [
              320,
              321,
              3264,
              454,
              456,
              402
            ]
          },
          {
            "id": 70,
            "name": "Army Bay",
            "adjacent": [
              69,
              70,
              71,
              72
            ]
          },
          {
            "id": 321,
            "name": "Big Manly",
            "adjacent": [
              320,
              321,
              3264,
              454,
              455,
              456,
              402
            ]
          },
          {
            "id": 247,
            "name": "Coatesville",
            "adjacent": [
              247,
              206,
              3265,
              248
            ]
          },
          {
            "id": 206,
            "name": "Dairy Flat",
            "adjacent": [
              206,
              247,
              3265,
              226,
              248
            ]
          },
          {
            "id": 197,
            "name": "Glorit",
            "adjacent": [
              197
            ]
          },
          {
            "id": 71,
            "name": "Gulf Harbour",
            "adjacent": [
              69,
              70,
              71,
              72,
              401
            ]
          },
          {
            "id": 43,
            "name": "Hatfields Beach",
            "adjacent": [
              43,
              274
            ]
          },
          {
            "id": 187,
            "name": "Helensville",
            "adjacent": [
              187,
              48
            ]
          },
          {
            "id": 69,
            "name": "Hobbs Bay",
            "adjacent": [
              69,
              70,
              71,
              72,
              401
            ]
          },
          {
            "id": 195,
            "name": "Hoteo",
            "adjacent": [
              195
            ]
          },
          {
            "id": 143,
            "name": "Huapai",
            "adjacent": [
              143,
              144
            ]
          },
          {
            "id": 194,
            "name": "Kaipara Flats",
            "adjacent": [
              194
            ]
          },
          {
            "id": 48,
            "name": "Kaukapakapa",
            "adjacent": [
              48,
              187
            ]
          },
          {
            "id": 144,
            "name": "Kumeu",
            "adjacent": [
              144,
              184,
              143
            ]
          },
          {
            "id": 199,
            "name": "Leigh",
            "adjacent": [
              199
            ]
          },
          {
            "id": 456,
            "name": "Little Manly",
            "adjacent": [
              320,
              321,
              3264,
              454,
              455,
              456,
              401,
              402
            ]
          },
          {
            "id": 281,
            "name": "Mahurangi",
            "adjacent": [
              281,
              3452
            ]
          },
          {
            "id": 3452,
            "name": "Mahurangi East",
            "adjacent": [
              281,
              3452
            ]
          },
          {
            "id": 45,
            "name": "Mahurangi West",
            "adjacent": [
              45
            ]
          },
          {
            "id": 58,
            "name": "Makarau",
            "adjacent": [
              58
            ]
          },
          {
            "id": 3744,
            "name": "Mangakura",
            "adjacent": [
              3744
            ]
          },
          {
            "id": 3264,
            "name": "Manly",
            "adjacent": [
              320,
              321,
              3264,
              454,
              455,
              456,
              401
            ]
          },
          {
            "id": 208,
            "name": "Matakana",
            "adjacent": [
              208,
              214,
              3487
            ]
          },
          {
            "id": 72,
            "name": "Matakatia Bay",
            "adjacent": [
              69,
              70,
              71,
              72,
              455,
              401
            ]
          },
          {
            "id": 224,
            "name": "Maygrove",
            "adjacent": [
              274,
              3484,
              221,
              224
            ]
          },
          {
            "id": 3603,
            "name": "Milldale",
            "adjacent": [
              3603,
              3484,
              221,
              220
            ]
          },
          {
            "id": 3484,
            "name": "Millwater",
            "adjacent": [
              3484,
              221,
              224,
              220,
              3603,
              274
            ]
          },
          {
            "id": 160,
            "name": "Muriwai Beach",
            "adjacent": [
              160,
              161
            ]
          },
          {
            "id": 161,
            "name": "Muriwai Valley",
            "adjacent": [
              160,
              161
            ]
          },
          {
            "id": 3648,
            "name": "Okura Bush",
            "adjacent": [
              3648,
              75,
              226
            ]
          },
          {
            "id": 278,
            "name": "Omaha",
            "adjacent": [
              241,
              278
            ]
          },
          {
            "id": 214,
            "name": "Omaha Flats",
            "adjacent": [
              208,
              214
            ]
          },
          {
            "id": 274,
            "name": "Orewa",
            "adjacent": [
              43,
              274,
              224,
              3484
            ]
          },
          {
            "id": 198,
            "name": "Pakiri",
            "adjacent": [
              198,
              207
            ]
          },
          {
            "id": 215,
            "name": "Parakai",
            "adjacent": [
              215
            ]
          },
          {
            "id": 2705,
            "name": "Parkhurst",
            "adjacent": [
              555,
              2705
            ]
          },
          {
            "id": 241,
            "name": "Point Wells",
            "adjacent": [
              241,
              278
            ]
          },
          {
            "id": 44,
            "name": "Puhoi",
            "adjacent": [
              44
            ]
          },
          {
            "id": 221,
            "name": "Red Beach",
            "adjacent": [
              3484,
              221,
              224,
              3603,
              402
            ]
          },
          {
            "id": 226,
            "name": "Redvale",
            "adjacent": [
              75,
              226,
              206,
              3648
            ]
          },
          {
            "id": 162,
            "name": "Riverhead",
            "adjacent": [
              162
            ]
          },
          {
            "id": 242,
            "name": "Sandspit",
            "adjacent": [
              242
            ]
          },
          {
            "id": 3447,
            "name": "Shelly Beach",
            "adjacent": [
              3447
            ]
          },
          {
            "id": 220,
            "name": "Silverdale",
            "adjacent": [
              220,
              3484,
              3603
            ]
          },
          {
            "id": 280,
            "name": "Snells Beach",
            "adjacent": [
              280,
              235
            ]
          },
          {
            "id": 2702,
            "name": "South Head",
            "adjacent": [
              2702
            ]
          },
          {
            "id": 402,
            "name": "Stanmore Bay",
            "adjacent": [
              320,
              321,
              454,
              456,
              402,
              225,
              221,
              401
            ]
          },
          {
            "id": 225,
            "name": "Stillwater",
            "adjacent": [
              454,
              402,
              225
            ]
          },
          {
            "id": 231,
            "name": "Streamlands",
            "adjacent": [
              231
            ]
          },
          {
            "id": 3817,
            "name": "Tahekeroa",
            "adjacent": [
              3817
            ]
          },
          {
            "id": 3114,
            "name": "Tapora",
            "adjacent": [
              3114,
              3515
            ]
          },
          {
            "id": 209,
            "name": "Tauhoa",
            "adjacent": [
              209,
              3515
            ]
          },
          {
            "id": 184,
            "name": "Taupaki",
            "adjacent": [
              184,
              144
            ]
          },
          {
            "id": 3487,
            "name": "Tawharanui Peninsula",
            "adjacent": [
              3487,
              208
            ]
          },
          {
            "id": 193,
            "name": "Te Arai",
            "adjacent": [
              193,
              207
            ]
          },
          {
            "id": 170,
            "name": "Te Hana",
            "adjacent": [
              170,
              3515
            ]
          },
          {
            "id": 236,
            "name": "The Grange",
            "adjacent": [
              236
            ]
          },
          {
            "id": 455,
            "name": "Tindalls Beach",
            "adjacent": [
              72,
              321,
              3264,
              455,
              456,
              401
            ]
          },
          {
            "id": 207,
            "name": "Tomarata",
            "adjacent": [
              207,
              193,
              198,
              233
            ]
          },
          {
            "id": 1572,
            "name": "Topuni",
            "adjacent": [
              1572
            ]
          },
          {
            "id": 454,
            "name": "Wade Heads",
            "adjacent": [
              320,
              321,
              3264,
              454,
              456,
              402,
              225
            ]
          },
          {
            "id": 205,
            "name": "Waikoukou Valley",
            "adjacent": [
              205
            ]
          },
          {
            "id": 185,
            "name": "Waimauku",
            "adjacent": [
              185
            ]
          },
          {
            "id": 248,
            "name": "Wainui",
            "adjacent": [
              248,
              206,
              247
            ]
          },
          {
            "id": 237,
            "name": "Waitoki",
            "adjacent": [
              237
            ]
          },
          {
            "id": 73,
            "name": "Waiwera",
            "adjacent": [
              73
            ]
          },
          {
            "id": 166,
            "name": "Warkworth",
            "adjacent": [
              166
            ]
          },
          {
            "id": 210,
            "name": "Wellsford",
            "adjacent": [
              210,
              3515
            ]
          },
          {
            "id": 401,
            "name": "Whangaparaoa",
            "adjacent": [
              69,
              71,
              72,
              3264,
              455,
              456,
              401,
              402
            ]
          },
          {
            "id": 233,
            "name": "Whangaripo",
            "adjacent": [
              233,
              207
            ]
          },
          {
            "id": 3515,
            "name": "Wharehine",
            "adjacent": [
              170,
              209,
              210,
              3114,
              3515
            ]
          },
          {
            "id": 201,
            "name": "Woodcocks",
            "adjacent": [
              201
            ]
          },
          {
            "id": 217,
            "name": "Woodhill",
            "adjacent": [
              217
            ]
          }
        ]
      },
      {
        "id": 77,
        "name": "Waiheke Island",
        "suburbs": [
          {
            "id": 3199,
            "name": "Awaawaroa Bay",
            "adjacent": [
              3199,
              3209,
              3450,
              3751
            ]
          },
          {
            "id": 356,
            "name": "Blackpool",
            "adjacent": [
              355,
              356,
              357,
              3200,
              3201,
              3281,
              3225,
              376
            ]
          },
          {
            "id": 357,
            "name": "Church Bay",
            "adjacent": [
              355,
              356,
              357,
              3201,
              3281,
              3225,
              376
            ]
          },
          {
            "id": 3245,
            "name": "Connells Bay",
            "adjacent": [
              3232,
              3245
            ]
          },
          {
            "id": 3232,
            "name": "Cowes Bay",
            "adjacent": [
              3232,
              3245
            ]
          },
          {
            "id": 3200,
            "name": "Enclosure Bay",
            "adjacent": [
              355,
              356,
              3045,
              3200,
              3201,
              3225,
              376,
              378
            ]
          },
          {
            "id": 3201,
            "name": "Hekerua Bay",
            "adjacent": [
              355,
              356,
              357,
              3045,
              3200,
              3201,
              3225,
              376,
              378
            ]
          },
          {
            "id": 3202,
            "name": "Kennedy Point",
            "adjacent": [
              3202,
              376
            ]
          },
          {
            "id": 3225,
            "name": "Little Oneroa",
            "adjacent": [
              355,
              356,
              357,
              3200,
              3201,
              3281,
              3225,
              376
            ]
          },
          {
            "id": 3281,
            "name": "Matiatia Bay",
            "adjacent": [
              355,
              356,
              357,
              3281,
              3225
            ]
          },
          {
            "id": 397,
            "name": "Omiha",
            "adjacent": [
              3203,
              3234,
              397,
              3667
            ]
          },
          {
            "id": 355,
            "name": "Oneroa",
            "adjacent": [
              355,
              356,
              357,
              3200,
              3201,
              3281,
              3225,
              376
            ]
          },
          {
            "id": 379,
            "name": "Onetangi",
            "adjacent": [
              3450,
              379
            ]
          },
          {
            "id": 398,
            "name": "Orapiu",
            "adjacent": [
              3204,
              398
            ]
          },
          {
            "id": 377,
            "name": "Ostend",
            "adjacent": [
              3045,
              3234,
              376,
              377,
              378
            ]
          },
          {
            "id": 378,
            "name": "Palm Beach",
            "adjacent": [
              3045,
              3200,
              3201,
              377,
              378
            ]
          },
          {
            "id": 3203,
            "name": "Rocky Bay",
            "adjacent": [
              3203,
              3209,
              3210,
              3234,
              397,
              3667
            ]
          },
          {
            "id": 3204,
            "name": "Sandy Bay",
            "adjacent": [
              3204,
              398
            ]
          },
          {
            "id": 376,
            "name": "Surfdale",
            "adjacent": [
              355,
              356,
              357,
              3045,
              3200,
              3201,
              3202,
              3225,
              376,
              377
            ]
          },
          {
            "id": 3209,
            "name": "Te Whau",
            "adjacent": [
              3199,
              3203,
              3209,
              3450,
              3667,
              3751
            ]
          },
          {
            "id": 3234,
            "name": "Te Whau Bay",
            "adjacent": [
              3203,
              3234,
              377,
              397
            ]
          },
          {
            "id": 3751,
            "name": "Waiheke Island",
            "adjacent": [
              3751,
              3199,
              3209,
              3450
            ]
          },
          {
            "id": 3450,
            "name": "Waikopou Bay",
            "adjacent": [
              3199,
              3209,
              3450,
              379,
              3751
            ]
          },
          {
            "id": 3667,
            "name": "Whakanewha",
            "adjacent": [
              3667,
              397,
              3203,
              3209,
              3210
            ]
          },
          {
            "id": 3210,
            "name": "Woodside Bay",
            "adjacent": [
              3203,
              3210,
              3667
            ]
          }
        ]
      },
      {
        "id": 6,
        "name": "Waitakere City",
        "suburbs": [
          {
            "id": 100,
            "name": "Anawhata",
            "adjacent": [
              100
            ]
          },
          {
            "id": 145,
            "name": "Bethells Beach",
            "adjacent": [
              145,
              151,
              158
            ]
          },
          {
            "id": 188,
            "name": "Cornwallis",
            "adjacent": [
              188
            ]
          },
          {
            "id": 266,
            "name": "French Bay",
            "adjacent": [
              261,
              262,
              266
            ]
          },
          {
            "id": 282,
            "name": "Glen Eden",
            "adjacent": [
              264,
              282,
              306,
              307,
              313,
              261
            ]
          },
          {
            "id": 265,
            "name": "Glendene",
            "adjacent": [
              263,
              264,
              265,
              2632,
              2634,
              243
            ]
          },
          {
            "id": 308,
            "name": "Green Bay",
            "adjacent": [
              261,
              262,
              307,
              308
            ]
          },
          {
            "id": 239,
            "name": "Harbour View",
            "adjacent": [
              239,
              1449,
              1460,
              1654,
              2119,
              2120,
              2121,
              2122,
              2123,
              2124,
              3350
            ]
          },
          {
            "id": 2634,
            "name": "Henderson",
            "adjacent": [
              260,
              264,
              265,
              309,
              310,
              2632,
              2634,
              257
            ]
          },
          {
            "id": 2632,
            "name": "Henderson Valley",
            "adjacent": [
              260,
              264,
              265,
              309,
              310,
              2632,
              2634,
              151,
              158,
              313
            ]
          },
          {
            "id": 222,
            "name": "Herald Island",
            "adjacent": [
              222,
              256,
              3528
            ]
          },
          {
            "id": 256,
            "name": "Hobsonville",
            "adjacent": [
              222,
              256,
              3528,
              405,
              223
            ]
          },
          {
            "id": 189,
            "name": "Huia",
            "adjacent": [
              189,
              462
            ]
          },
          {
            "id": 463,
            "name": "Karekare",
            "adjacent": [
              463
            ]
          },
          {
            "id": 263,
            "name": "Kelston",
            "adjacent": [
              263,
              265,
              307
            ]
          },
          {
            "id": 306,
            "name": "Konini",
            "adjacent": [
              261,
              282,
              306,
              311
            ]
          },
          {
            "id": 150,
            "name": "Laingholm",
            "adjacent": [
              150,
              261,
              267,
              311,
              190
            ]
          },
          {
            "id": 462,
            "name": "Little Huia",
            "adjacent": [
              189,
              462
            ]
          },
          {
            "id": 3255,
            "name": "Massey",
            "adjacent": [
              245,
              246,
              255,
              3255,
              3257,
              3392,
              3242,
              223,
              257
            ]
          },
          {
            "id": 255,
            "name": "Massey East",
            "adjacent": [
              245,
              246,
              255,
              3255,
              3257,
              3392,
              3242
            ]
          },
          {
            "id": 246,
            "name": "Massey North",
            "adjacent": [
              245,
              246,
              255,
              3255,
              3257,
              3392,
              3242
            ]
          },
          {
            "id": 245,
            "name": "Massey West",
            "adjacent": [
              245,
              246,
              255,
              3255,
              3257,
              3392,
              3242
            ]
          },
          {
            "id": 310,
            "name": "Mclaren Park",
            "adjacent": [
              260,
              264,
              309,
              310,
              2632,
              2634
            ]
          },
          {
            "id": 307,
            "name": "New Lynn",
            "adjacent": [
              149,
              263,
              307,
              308,
              282
            ]
          },
          {
            "id": 2635,
            "name": "Oratia",
            "adjacent": [
              2635,
              261
            ]
          },
          {
            "id": 309,
            "name": "Palm Heights",
            "adjacent": [
              260,
              309,
              310,
              2632,
              2634
            ]
          },
          {
            "id": 190,
            "name": "Parau",
            "adjacent": [
              190,
              267,
              150
            ]
          },
          {
            "id": 101,
            "name": "Piha",
            "adjacent": [
              101
            ]
          },
          {
            "id": 257,
            "name": "Ranui",
            "adjacent": [
              257,
              260,
              151,
              3255,
              2634
            ]
          },
          {
            "id": 3257,
            "name": "Royal Heights",
            "adjacent": [
              245,
              246,
              255,
              3255,
              3257,
              3392,
              3242,
              223
            ]
          },
          {
            "id": 264,
            "name": "Sunnyvale",
            "adjacent": [
              264,
              265,
              282,
              310,
              2632,
              2634
            ]
          },
          {
            "id": 151,
            "name": "Swanson",
            "adjacent": [
              151,
              158,
              257,
              2632,
              145
            ]
          },
          {
            "id": 268,
            "name": "Te Atatu Peninsula",
            "adjacent": [
              238,
              268
            ]
          },
          {
            "id": 243,
            "name": "Te Atatu South",
            "adjacent": [
              238,
              243,
              265
            ]
          },
          {
            "id": 261,
            "name": "Titirangi",
            "adjacent": [
              150,
              261,
              262,
              266,
              306,
              308,
              313,
              282,
              2635
            ]
          },
          {
            "id": 313,
            "name": "Waiatarua",
            "adjacent": [
              313,
              2632,
              261,
              282
            ]
          },
          {
            "id": 311,
            "name": "Waima",
            "adjacent": [
              150,
              306,
              311
            ]
          },
          {
            "id": 238,
            "name": "Waimanu Bay",
            "adjacent": [
              238,
              243,
              268
            ]
          },
          {
            "id": 158,
            "name": "Waitakere",
            "adjacent": [
              158,
              151,
              2632,
              145
            ]
          },
          {
            "id": 223,
            "name": "West Harbour",
            "adjacent": [
              223,
              3242,
              3255,
              3257,
              3392,
              3528,
              256,
              405
            ]
          },
          {
            "id": 260,
            "name": "Western Heights",
            "adjacent": [
              257,
              260,
              309,
              310,
              2632,
              2634
            ]
          },
          {
            "id": 3392,
            "name": "Westgate",
            "adjacent": [
              245,
              246,
              255,
              3255,
              3257,
              3392,
              3242,
              223
            ]
          },
          {
            "id": 396,
            "name": "Whatipu",
            "adjacent": [
              396
            ]
          },
          {
            "id": 405,
            "name": "Whenuapai",
            "adjacent": [
              405,
              256,
              223
            ]
          },
          {
            "id": 262,
            "name": "Wood Bay",
            "adjacent": [
              261,
              262,
              266,
              308
            ]
          },
          {
            "id": 267,
            "name": "Woodlands Park",
            "adjacent": [
              150,
              190,
              267
            ]
          }
        ]
      }
    ]
  },
  {
    "id": 14,
    "name": "Waikato",
    "districts": [
      {
        "id": 16,
        "name": "Hamilton",
        "suburbs": [
          {
            "id": 3756,
            "name": "Avalon",
            "adjacent": [
              3756,
              3646,
              1152,
              1151,
              1270,
              1305,
              1269
            ]
          },
          {
            "id": 3278,
            "name": "Bader",
            "adjacent": [
              1024,
              1025,
              1366,
              3278,
              1239,
              1243,
              3491,
              3677
            ]
          },
          {
            "id": 3646,
            "name": "Baverstock",
            "adjacent": [
              3646,
              3514,
              1151,
              3306,
              1269,
              3756
            ]
          },
          {
            "id": 1304,
            "name": "Beerescourt",
            "adjacent": [
              1265,
              1266,
              1267,
              1268,
              1269,
              975,
              1152,
              1153,
              1304,
              1305
            ]
          },
          {
            "id": 3789,
            "name": "Burbush",
            "adjacent": [
              3789,
              3306
            ]
          },
          {
            "id": 1268,
            "name": "Chartwell",
            "adjacent": [
              1185,
              1265,
              1266,
              1267,
              1268,
              1381,
              975,
              976,
              1152,
              1153,
              1304,
              1305
            ]
          },
          {
            "id": 976,
            "name": "Chedworth Park",
            "adjacent": [
              1184,
              1267,
              1268,
              3107,
              975,
              976,
              977
            ]
          },
          {
            "id": 1266,
            "name": "Claudelands",
            "adjacent": [
              1185,
              1265,
              1266,
              1267,
              1268,
              1381,
              3215,
              3223,
              3224,
              1304,
              1243
            ]
          },
          {
            "id": 1025,
            "name": "Deanwell",
            "adjacent": [
              1024,
              1025,
              1366,
              3278,
              1239
            ]
          },
          {
            "id": 1380,
            "name": "Dinsdale",
            "adjacent": [
              1380,
              1382,
              1150,
              1151,
              1244,
              3514
            ]
          },
          {
            "id": 1185,
            "name": "Enderley",
            "adjacent": [
              1184,
              1185,
              1265,
              1266,
              1267,
              1268,
              1381,
              3215,
              3223,
              3224
            ]
          },
          {
            "id": 1267,
            "name": "Fairfield",
            "adjacent": [
              1184,
              1185,
              1265,
              1266,
              1267,
              1268,
              975,
              976,
              977,
              1304
            ]
          },
          {
            "id": 1184,
            "name": "Fairview Downs",
            "adjacent": [
              1184,
              1185,
              1267,
              976
            ]
          },
          {
            "id": 1239,
            "name": "Fitzroy",
            "adjacent": [
              1024,
              1025,
              1366,
              3278,
              1239,
              3677
            ]
          },
          {
            "id": 974,
            "name": "Flagstaff",
            "adjacent": [
              1270,
              3107,
              974,
              1305,
              1240
            ]
          },
          {
            "id": 1152,
            "name": "Forest Lake",
            "adjacent": [
              1265,
              1268,
              1269,
              1151,
              1152,
              1153,
              1304,
              1305,
              3756
            ]
          },
          {
            "id": 1244,
            "name": "Frankton",
            "adjacent": [
              1265,
              1380,
              1381,
              1382,
              3215,
              3223,
              3224,
              1153,
              1243,
              1244,
              3491
            ]
          },
          {
            "id": 1366,
            "name": "Glenview",
            "adjacent": [
              1024,
              1025,
              1366,
              3278,
              1239
            ]
          },
          {
            "id": 3514,
            "name": "Grandview Heights",
            "adjacent": [
              1150,
              1151,
              1380,
              3306,
              3514,
              3646
            ]
          },
          {
            "id": 3215,
            "name": "Hamilton City Central",
            "adjacent": [
              1185,
              1265,
              1266,
              1381,
              3215,
              3223,
              3224,
              1153,
              1243,
              1244,
              3491
            ]
          },
          {
            "id": 1240,
            "name": "Hamilton East",
            "adjacent": [
              1270,
              974,
              1240
            ]
          },
          {
            "id": 3491,
            "name": "Hamilton Lake",
            "adjacent": [
              1024,
              1381,
              3215,
              3223,
              3278,
              3224,
              1243,
              1244,
              3491
            ]
          },
          {
            "id": 1381,
            "name": "Hamilton North",
            "adjacent": [
              1185,
              1265,
              1266,
              1268,
              1381,
              3215,
              3223,
              3224,
              1153,
              1243,
              1244,
              3491
            ]
          },
          {
            "id": 1243,
            "name": "Hamilton West",
            "adjacent": [
              1265,
              1266,
              1381,
              3215,
              3223,
              3278,
              3224,
              1243,
              1244,
              3491
            ]
          },
          {
            "id": 3223,
            "name": "Harrowfield",
            "adjacent": [
              1185,
              1265,
              1266,
              1381,
              3215,
              3223,
              3224,
              1153,
              1243,
              1244,
              3491
            ]
          },
          {
            "id": 1241,
            "name": "Hillcrest",
            "adjacent": [
              1186,
              3446,
              1303,
              1241,
              1242,
              3677
            ]
          },
          {
            "id": 777,
            "name": "Horsham Downs",
            "adjacent": [
              777
            ]
          },
          {
            "id": 3477,
            "name": "Huntington",
            "adjacent": [
              3107,
              975,
              977,
              3477
            ]
          },
          {
            "id": 1382,
            "name": "Livingstone",
            "adjacent": [
              1265,
              1380,
              1382,
              1150,
              1151,
              1153,
              1244
            ]
          },
          {
            "id": 1153,
            "name": "Maeroa",
            "adjacent": [
              1265,
              1268,
              1381,
              1382,
              3215,
              3223,
              3224,
              1151,
              1152,
              1153,
              1304,
              1244
            ]
          },
          {
            "id": 1024,
            "name": "Melville",
            "adjacent": [
              1024,
              1025,
              1366,
              3278,
              1239,
              3491
            ]
          },
          {
            "id": 1151,
            "name": "Nawton",
            "adjacent": [
              1380,
              1382,
              1150,
              1151,
              1152,
              1153,
              3514,
              3646,
              3756
            ]
          },
          {
            "id": 3677,
            "name": "Peacocke",
            "adjacent": [
              3677,
              3278,
              1239,
              1241,
              3446,
              1186
            ]
          },
          {
            "id": 3579,
            "name": "Pukemoremore",
            "adjacent": [
              3579
            ]
          },
          {
            "id": 1270,
            "name": "Pukete",
            "adjacent": [
              1269,
              1270,
              974,
              1305,
              1240,
              3756
            ]
          },
          {
            "id": 975,
            "name": "Queenwood",
            "adjacent": [
              1267,
              1268,
              3107,
              975,
              976,
              977,
              1304,
              1305,
              3477
            ]
          },
          {
            "id": 3446,
            "name": "Riverlea",
            "adjacent": [
              1186,
              3446,
              1303,
              1241,
              1242,
              3677
            ]
          },
          {
            "id": 3306,
            "name": "Rotokauri ",
            "adjacent": [
              3306,
              3514,
              3646,
              3789
            ]
          },
          {
            "id": 3107,
            "name": "Rototuna",
            "adjacent": [
              3107,
              974,
              975,
              976,
              977,
              3477
            ]
          },
          {
            "id": 3270,
            "name": "Ruakura",
            "adjacent": [
              3270,
              897
            ]
          },
          {
            "id": 3236,
            "name": "Rukuhia",
            "adjacent": [
              3236,
              3307
            ]
          },
          {
            "id": 1305,
            "name": "Saint Andrews",
            "adjacent": [
              1268,
              1269,
              1270,
              974,
              975,
              1152,
              1304,
              1305,
              3756
            ]
          },
          {
            "id": 1186,
            "name": "Silverdale",
            "adjacent": [
              1186,
              3446,
              1303,
              1241,
              1242,
              3677
            ]
          },
          {
            "id": 1269,
            "name": "Te Rapa",
            "adjacent": [
              1269,
              1270,
              1152,
              1304,
              1305,
              3646,
              3756
            ]
          },
          {
            "id": 2764,
            "name": "Temple View",
            "adjacent": [
              2764,
              3403
            ]
          },
          {
            "id": 3224,
            "name": "Thornton Estate",
            "adjacent": [
              1185,
              1265,
              1266,
              1381,
              3215,
              3223,
              3224,
              1153,
              1243,
              1244,
              3491
            ]
          },
          {
            "id": 1150,
            "name": "Western Heights",
            "adjacent": [
              1380,
              1382,
              1150,
              1151,
              3514
            ]
          },
          {
            "id": 1265,
            "name": "Whitiora",
            "adjacent": [
              1185,
              1265,
              1266,
              1267,
              1268,
              1381,
              1382,
              3215,
              3223,
              3224,
              1152,
              1153,
              1304,
              1243,
              1244
            ]
          }
        ]
      },
      {
        "id": 12,
        "name": "Hauraki",
        "suburbs": [
          {
            "id": 3664,
            "name": "Awaiti",
            "adjacent": [
              3664
            ]
          },
          {
            "id": 3662,
            "name": "Kaihere",
            "adjacent": [
              3662
            ]
          },
          {
            "id": 3494,
            "name": "Karangahake",
            "adjacent": [
              3494
            ]
          },
          {
            "id": 649,
            "name": "Kerepehi",
            "adjacent": [
              649
            ]
          },
          {
            "id": 3553,
            "name": "Mangatarata",
            "adjacent": [
              3553
            ]
          },
          {
            "id": 846,
            "name": "Netherton",
            "adjacent": [
              846
            ]
          },
          {
            "id": 648,
            "name": "Ngatea",
            "adjacent": [
              648
            ]
          },
          {
            "id": 3619,
            "name": "Orongo",
            "adjacent": [
              3619
            ]
          },
          {
            "id": 847,
            "name": "Paeroa",
            "adjacent": [
              847
            ]
          },
          {
            "id": 3663,
            "name": "Pipiroa",
            "adjacent": [
              3663
            ]
          },
          {
            "id": 763,
            "name": "Turua",
            "adjacent": [
              763
            ]
          },
          {
            "id": 460,
            "name": "Waihi",
            "adjacent": [
              453,
              460
            ]
          },
          {
            "id": 453,
            "name": "Waihi East",
            "adjacent": [
              453,
              460
            ]
          },
          {
            "id": 597,
            "name": "Waikino",
            "adjacent": [
              597
            ]
          },
          {
            "id": 645,
            "name": "Waitakaruru",
            "adjacent": [
              645,
              728
            ]
          },
          {
            "id": 765,
            "name": "Whiritoa",
            "adjacent": [
              765
            ]
          }
        ]
      },
      {
        "id": 15,
        "name": "Matamata-Piako",
        "suburbs": [
          {
            "id": 3872,
            "name": "Hoe-O-Tainui",
            "adjacent": [
              3872
            ]
          },
          {
            "id": 824,
            "name": "Mangateparu",
            "adjacent": [
              824
            ]
          },
          {
            "id": 859,
            "name": "Matamata",
            "adjacent": [
              859
            ]
          },
          {
            "id": 538,
            "name": "Morrinsville",
            "adjacent": [
              538
            ]
          },
          {
            "id": 722,
            "name": "Patetonga",
            "adjacent": [
              722,
              3604
            ]
          },
          {
            "id": 595,
            "name": "Springdale",
            "adjacent": [
              595
            ]
          },
          {
            "id": 848,
            "name": "Tahuna",
            "adjacent": [
              848
            ]
          },
          {
            "id": 3595,
            "name": "Tauhei",
            "adjacent": [
              3595
            ]
          },
          {
            "id": 987,
            "name": "Te Aroha",
            "adjacent": [
              987
            ]
          },
          {
            "id": 862,
            "name": "Te Poi",
            "adjacent": [
              862
            ]
          },
          {
            "id": 723,
            "name": "Waharoa",
            "adjacent": [
              723
            ]
          },
          {
            "id": 827,
            "name": "Waihou",
            "adjacent": [
              827
            ]
          },
          {
            "id": 826,
            "name": "Waitoa",
            "adjacent": [
              826
            ]
          },
          {
            "id": 1160,
            "name": "Walton",
            "adjacent": [
              1160
            ]
          }
        ]
      },
      {
        "id": 18,
        "name": "Otorohanga",
        "suburbs": [
          {
            "id": 3510,
            "name": "Aotea Harbour",
            "adjacent": [
              3510
            ]
          },
          {
            "id": 674,
            "name": "Kawhia",
            "adjacent": [
              674
            ]
          },
          {
            "id": 688,
            "name": "Otorohanga",
            "adjacent": [
              688
            ]
          }
        ]
      },
      {
        "id": 19,
        "name": "South Waikato",
        "suburbs": [
          {
            "id": 801,
            "name": "Arapuni",
            "adjacent": [
              800,
              801
            ]
          },
          {
            "id": 880,
            "name": "Hodderville",
            "adjacent": [
              880
            ]
          },
          {
            "id": 3749,
            "name": "Kinleith",
            "adjacent": [
              3749
            ]
          },
          {
            "id": 831,
            "name": "Lichfield",
            "adjacent": [
              831
            ]
          },
          {
            "id": 832,
            "name": "Ngatira",
            "adjacent": [
              832
            ]
          },
          {
            "id": 3874,
            "name": "Piarere",
            "adjacent": [
              3874
            ]
          },
          {
            "id": 803,
            "name": "Putaruru",
            "adjacent": [
              803
            ]
          },
          {
            "id": 863,
            "name": "Tirau",
            "adjacent": [
              863
            ]
          },
          {
            "id": 834,
            "name": "Tokoroa",
            "adjacent": [
              834
            ]
          },
          {
            "id": 833,
            "name": "Wiltsdown",
            "adjacent": [
              833
            ]
          }
        ]
      },
      {
        "id": 21,
        "name": "Taupo",
        "suburbs": [
          {
            "id": 1106,
            "name": "Acacia Bay",
            "adjacent": [
              1106
            ]
          },
          {
            "id": 3617,
            "name": "Bonshaw Park",
            "adjacent": [
              3617
            ]
          },
          {
            "id": 3499,
            "name": "Broadlands Forest",
            "adjacent": [
              3499
            ]
          },
          {
            "id": 3540,
            "name": "Hatepe",
            "adjacent": [
              3540
            ]
          },
          {
            "id": 1330,
            "name": "Hilltop",
            "adjacent": [
              1023,
              3196,
              3221,
              1300,
              1301,
              1330,
              3542
            ]
          },
          {
            "id": 3196,
            "name": "Invergarry",
            "adjacent": [
              1023,
              3196,
              1300,
              1330
            ]
          },
          {
            "id": 1298,
            "name": "Kinloch",
            "adjacent": [
              1298
            ]
          },
          {
            "id": 1103,
            "name": "Kuratau",
            "adjacent": [
              1103,
              3527
            ]
          },
          {
            "id": 1715,
            "name": "Lake Taupo",
            "adjacent": [
              1715
            ]
          },
          {
            "id": 787,
            "name": "Mangakino",
            "adjacent": [
              787
            ]
          },
          {
            "id": 3543,
            "name": "Marotiri",
            "adjacent": [
              3543
            ]
          },
          {
            "id": 3618,
            "name": "Maunganamu",
            "adjacent": [
              3618,
              1299,
              3221,
              3542,
              1108
            ]
          },
          {
            "id": 1102,
            "name": "Motuoapa",
            "adjacent": [
              1102
            ]
          },
          {
            "id": 1107,
            "name": "Nukuhau",
            "adjacent": [
              1107,
              1301,
              3512
            ]
          },
          {
            "id": 3737,
            "name": "Ohakuri",
            "adjacent": [
              3737
            ]
          },
          {
            "id": 3266,
            "name": "Omori",
            "adjacent": [
              3266,
              3244
            ]
          },
          {
            "id": 1351,
            "name": "Oruanui",
            "adjacent": [
              1351
            ]
          },
          {
            "id": 3405,
            "name": "Oruatua",
            "adjacent": [
              1109,
              3405,
              3666
            ]
          },
          {
            "id": 3244,
            "name": "Pukawa",
            "adjacent": [
              3266,
              3244
            ]
          },
          {
            "id": 1299,
            "name": "Rainbow Point",
            "adjacent": [
              1108,
              3221,
              1299,
              3542,
              3618
            ]
          },
          {
            "id": 3512,
            "name": "Rangatira Park",
            "adjacent": [
              1107,
              1301,
              3512
            ]
          },
          {
            "id": 3221,
            "name": "Richmond Heights",
            "adjacent": [
              3221,
              1299,
              1300,
              1330,
              3542,
              3618
            ]
          },
          {
            "id": 1023,
            "name": "Tauhara",
            "adjacent": [
              1023,
              3196,
              1301,
              1330
            ]
          },
          {
            "id": 3666,
            "name": "Tauranga Taupo",
            "adjacent": [
              3666,
              3405,
              1109
            ]
          },
          {
            "id": 1109,
            "name": "Te Rangiita",
            "adjacent": [
              1109,
              3404,
              3405,
              3666
            ]
          },
          {
            "id": 791,
            "name": "Tongariro",
            "adjacent": [
              791
            ]
          },
          {
            "id": 1301,
            "name": "Town Centre",
            "adjacent": [
              1023,
              1107,
              1301,
              1330,
              3512
            ]
          },
          {
            "id": 1101,
            "name": "Turangi",
            "adjacent": [
              1101
            ]
          },
          {
            "id": 3542,
            "name": "Two Mile Bay",
            "adjacent": [
              3542,
              1330,
              1299,
              3221,
              1300,
              3618
            ]
          },
          {
            "id": 1300,
            "name": "Waipahihi",
            "adjacent": [
              3196,
              3221,
              1300,
              1330,
              3542
            ]
          },
          {
            "id": 994,
            "name": "Wairakei",
            "adjacent": [
              994
            ]
          },
          {
            "id": 1264,
            "name": "Waitahanui",
            "adjacent": [
              1264
            ]
          },
          {
            "id": 3404,
            "name": "Waitetoko",
            "adjacent": [
              1109,
              3404
            ]
          },
          {
            "id": 3527,
            "name": "Whareroa",
            "adjacent": [
              1103,
              3527
            ]
          },
          {
            "id": 1108,
            "name": "Wharewaka",
            "adjacent": [
              1108,
              1299,
              3618
            ]
          }
        ]
      },
      {
        "id": 11,
        "name": "Thames-Coromandel",
        "suburbs": [
          {
            "id": 618,
            "name": "Cooks Beach",
            "adjacent": [
              618,
              3323
            ]
          },
          {
            "id": 624,
            "name": "Coroglen",
            "adjacent": [
              624
            ]
          },
          {
            "id": 728,
            "name": "Coromandel",
            "adjacent": [
              645,
              728
            ]
          },
          {
            "id": 3712,
            "name": "Ferry Landing",
            "adjacent": [
              3712,
              3323,
              2683
            ]
          },
          {
            "id": 3323,
            "name": "Flaxmill Bay",
            "adjacent": [
              618,
              2683,
              3323,
              3712
            ]
          },
          {
            "id": 625,
            "name": "Hahei",
            "adjacent": [
              625
            ]
          },
          {
            "id": 621,
            "name": "Hikuai",
            "adjacent": [
              621,
              607,
              619,
              2723
            ]
          },
          {
            "id": 3283,
            "name": "Hikutaia ",
            "adjacent": [
              3283
            ]
          },
          {
            "id": 623,
            "name": "Hot Water Beach",
            "adjacent": [
              623
            ]
          },
          {
            "id": 1022,
            "name": "Kaimarama",
            "adjacent": [
              1022
            ]
          },
          {
            "id": 3825,
            "name": "Kennedy Bay",
            "adjacent": [
              3825
            ]
          },
          {
            "id": 3888,
            "name": "Kereta",
            "adjacent": [
              3888
            ]
          },
          {
            "id": 610,
            "name": "Kopu",
            "adjacent": [
              610,
              3285
            ]
          },
          {
            "id": 3213,
            "name": "Kuaotunu Beach",
            "adjacent": [
              3213
            ]
          },
          {
            "id": 629,
            "name": "Matarangi",
            "adjacent": [
              629
            ]
          },
          {
            "id": 3285,
            "name": "Matatoki ",
            "adjacent": [
              610,
              3285
            ]
          },
          {
            "id": 761,
            "name": "Onemana",
            "adjacent": [
              761
            ]
          },
          {
            "id": 627,
            "name": "Opito",
            "adjacent": [
              627
            ]
          },
          {
            "id": 3826,
            "name": "Opoutere",
            "adjacent": [
              3826
            ]
          },
          {
            "id": 1978,
            "name": "Otama",
            "adjacent": [
              1978
            ]
          },
          {
            "id": 2723,
            "name": "Pauanui",
            "adjacent": [
              619,
              2723
            ]
          },
          {
            "id": 794,
            "name": "Port Charles",
            "adjacent": [
              794
            ]
          },
          {
            "id": 3282,
            "name": "Puriri ",
            "adjacent": [
              3282
            ]
          },
          {
            "id": 3784,
            "name": "Ruamahunga",
            "adjacent": [
              3784
            ]
          },
          {
            "id": 3699,
            "name": "Slipper Island",
            "adjacent": [
              3699
            ]
          },
          {
            "id": 619,
            "name": "Tairua",
            "adjacent": [
              619,
              2723
            ]
          },
          {
            "id": 606,
            "name": "Tapu",
            "adjacent": [
              606
            ]
          },
          {
            "id": 3782,
            "name": "Tararu",
            "adjacent": [
              3782
            ]
          },
          {
            "id": 3673,
            "name": "Te Mata",
            "adjacent": [
              3673
            ]
          },
          {
            "id": 607,
            "name": "Te Puru",
            "adjacent": [
              607,
              3781
            ]
          },
          {
            "id": 3885,
            "name": "Te Rerenga",
            "adjacent": [
              3885
            ]
          },
          {
            "id": 608,
            "name": "Thames",
            "adjacent": [
              608
            ]
          },
          {
            "id": 3781,
            "name": "Thornton Bay",
            "adjacent": [
              3781,
              607
            ]
          },
          {
            "id": 3530,
            "name": "Tuateawa",
            "adjacent": [
              3530
            ]
          },
          {
            "id": 3593,
            "name": "Waiomu",
            "adjacent": [
              3593
            ]
          },
          {
            "id": 3783,
            "name": "Whakatete Bay",
            "adjacent": [
              3783
            ]
          },
          {
            "id": 762,
            "name": "Whangamata",
            "adjacent": [
              762
            ]
          },
          {
            "id": 630,
            "name": "Whangapoua",
            "adjacent": [
              630
            ]
          },
          {
            "id": 622,
            "name": "Whenuakite",
            "adjacent": [
              622
            ]
          },
          {
            "id": 2683,
            "name": "Whitianga",
            "adjacent": [
              2683,
              3323,
              3712
            ]
          }
        ]
      },
      {
        "id": 13,
        "name": "Waikato",
        "suburbs": [
          {
            "id": 800,
            "name": "Arapuni",
            "adjacent": [
              800,
              801
            ]
          },
          {
            "id": 902,
            "name": "Eureka",
            "adjacent": [
              902
            ]
          },
          {
            "id": 3761,
            "name": "Glen Afton",
            "adjacent": [
              3761,
              3812
            ]
          },
          {
            "id": 3750,
            "name": "Glen Massey",
            "adjacent": [
              3750,
              1060
            ]
          },
          {
            "id": 669,
            "name": "Glen Murray",
            "adjacent": [
              669
            ]
          },
          {
            "id": 1089,
            "name": "Gordonton",
            "adjacent": [
              1089
            ]
          },
          {
            "id": 3500,
            "name": "Hampton Downs",
            "adjacent": [
              3500
            ]
          },
          {
            "id": 805,
            "name": "Horotiu",
            "adjacent": [
              805
            ]
          },
          {
            "id": 592,
            "name": "Huntly",
            "adjacent": [
              592
            ]
          },
          {
            "id": 1091,
            "name": "Kainui",
            "adjacent": [
              1091
            ]
          },
          {
            "id": 896,
            "name": "Matangi",
            "adjacent": [
              896
            ]
          },
          {
            "id": 662,
            "name": "Meremere",
            "adjacent": [
              662
            ]
          },
          {
            "id": 1084,
            "name": "Miranda",
            "adjacent": [
              1084
            ]
          },
          {
            "id": 897,
            "name": "Newstead",
            "adjacent": [
              3270,
              897
            ]
          },
          {
            "id": 1088,
            "name": "Ngaruawahia",
            "adjacent": [
              1088
            ]
          },
          {
            "id": 715,
            "name": "Ohinewai",
            "adjacent": [
              715
            ]
          },
          {
            "id": 675,
            "name": "Oparau",
            "adjacent": [
              675
            ]
          },
          {
            "id": 718,
            "name": "Orini",
            "adjacent": [
              718
            ]
          },
          {
            "id": 3812,
            "name": "Pukemiro",
            "adjacent": [
              3812,
              3761
            ]
          },
          {
            "id": 775,
            "name": "Puketaha",
            "adjacent": [
              775
            ]
          },
          {
            "id": 850,
            "name": "Raglan",
            "adjacent": [
              850,
              3587
            ]
          },
          {
            "id": 714,
            "name": "Rangiriri",
            "adjacent": [
              714
            ]
          },
          {
            "id": 3267,
            "name": "Rotongaro",
            "adjacent": [
              3267
            ]
          },
          {
            "id": 3808,
            "name": "Ruawaro",
            "adjacent": [
              3808
            ]
          },
          {
            "id": 890,
            "name": "Tamahere",
            "adjacent": [
              890
            ]
          },
          {
            "id": 1092,
            "name": "Taupiri",
            "adjacent": [
              1092
            ]
          },
          {
            "id": 1278,
            "name": "Tauwhare",
            "adjacent": [
              1278
            ]
          },
          {
            "id": 704,
            "name": "Te Akau",
            "adjacent": [
              704
            ]
          },
          {
            "id": 717,
            "name": "Te Hoe",
            "adjacent": [
              717
            ]
          },
          {
            "id": 713,
            "name": "Te Kauwhata",
            "adjacent": [
              713
            ]
          },
          {
            "id": 1060,
            "name": "Te Kowhai",
            "adjacent": [
              1060,
              3750
            ]
          },
          {
            "id": 3271,
            "name": "Te Uku",
            "adjacent": [
              3271
            ]
          },
          {
            "id": 3548,
            "name": "Tirohanga",
            "adjacent": [
              3548
            ]
          },
          {
            "id": 665,
            "name": "Waerenga",
            "adjacent": [
              665
            ]
          },
          {
            "id": 3634,
            "name": "Waikaretu",
            "adjacent": [
              3634
            ]
          },
          {
            "id": 3197,
            "name": "Waikato Surrounds",
            "adjacent": [
              3197
            ]
          },
          {
            "id": 3511,
            "name": "Waiterimu",
            "adjacent": [
              3511
            ]
          },
          {
            "id": 3587,
            "name": "Waitetuna",
            "adjacent": [
              3587,
              850
            ]
          },
          {
            "id": 1183,
            "name": "Whakamaru",
            "adjacent": [
              1183
            ]
          },
          {
            "id": 768,
            "name": "Whatawhata",
            "adjacent": [
              768
            ]
          },
          {
            "id": 820,
            "name": "Whitikahu",
            "adjacent": [
              820
            ]
          }
        ]
      },
      {
        "id": 17,
        "name": "Waipa",
        "suburbs": [
          {
            "id": 696,
            "name": "Cambridge",
            "adjacent": [
              696
            ]
          },
          {
            "id": 864,
            "name": "Horahora",
            "adjacent": [
              864,
              3755
            ]
          },
          {
            "id": 638,
            "name": "Kaipaki",
            "adjacent": [
              638,
              756
            ]
          },
          {
            "id": 796,
            "name": "Karamu",
            "adjacent": [
              796
            ]
          },
          {
            "id": 885,
            "name": "Karapiro",
            "adjacent": [
              885
            ]
          },
          {
            "id": 1625,
            "name": "Kihikihi",
            "adjacent": [
              1625
            ]
          },
          {
            "id": 3403,
            "name": "Koromatua",
            "adjacent": [
              2764,
              3403
            ]
          },
          {
            "id": 884,
            "name": "Leamington",
            "adjacent": [
              884
            ]
          },
          {
            "id": 3755,
            "name": "Maungatautari",
            "adjacent": [
              3755,
              864
            ]
          },
          {
            "id": 797,
            "name": "Ngahinapouri",
            "adjacent": [
              797
            ]
          },
          {
            "id": 756,
            "name": "Ohaupo",
            "adjacent": [
              756
            ]
          },
          {
            "id": 753,
            "name": "Pirongia",
            "adjacent": [
              753
            ]
          },
          {
            "id": 3726,
            "name": "Pukeatua",
            "adjacent": [
              3726,
              604
            ]
          },
          {
            "id": 695,
            "name": "Pukekura",
            "adjacent": [
              695
            ]
          },
          {
            "id": 882,
            "name": "Rotoorangi",
            "adjacent": [
              882
            ]
          },
          {
            "id": 3307,
            "name": "Rukuhia ",
            "adjacent": [
              3236,
              3307
            ]
          },
          {
            "id": 1624,
            "name": "Te Awamutu",
            "adjacent": [
              1624
            ]
          },
          {
            "id": 3815,
            "name": "Te Miro",
            "adjacent": [
              3815
            ]
          },
          {
            "id": 798,
            "name": "Te Pahu",
            "adjacent": [
              798
            ]
          },
          {
            "id": 754,
            "name": "Te Rore",
            "adjacent": [
              754
            ]
          },
          {
            "id": 3704,
            "name": "Wharepapa South",
            "adjacent": [
              3704
            ]
          }
        ]
      },
      {
        "id": 20,
        "name": "Waitomo",
        "suburbs": [
          {
            "id": 815,
            "name": "Awakino",
            "adjacent": [
              815
            ]
          },
          {
            "id": 3567,
            "name": "Benneydale",
            "adjacent": [
              3567
            ]
          },
          {
            "id": 3552,
            "name": "Marokopa",
            "adjacent": [
              3552
            ]
          },
          {
            "id": 749,
            "name": "Piopio",
            "adjacent": [
              749
            ]
          },
          {
            "id": 786,
            "name": "Te Kuiti",
            "adjacent": [
              786
            ]
          }
        ]
      }
    ]
  },
  {
    "id": 2,
    "name": "Bay Of Plenty",
    "districts": [
      {
        "id": 26,
        "name": "Kawerau",
        "suburbs": [
          {
            "id": 442,
            "name": "Kawerau",
            "adjacent": [
              442
            ]
          }
        ]
      },
      {
        "id": 27,
        "name": "Opotiki",
        "suburbs": [
          {
            "id": 572,
            "name": "Hospital Hill",
            "adjacent": [
              572,
              3176,
              1075,
              1076,
              1077,
              1078,
              1154,
              3797,
              3821
            ]
          },
          {
            "id": 653,
            "name": "Kutarere",
            "adjacent": [
              653
            ]
          },
          {
            "id": 3614,
            "name": "Ohiwa",
            "adjacent": [
              3614
            ]
          },
          {
            "id": 570,
            "name": "Opotiki",
            "adjacent": [
              570
            ]
          },
          {
            "id": 457,
            "name": "Te Kaha",
            "adjacent": [
              457
            ]
          },
          {
            "id": 3668,
            "name": "Tirohanga",
            "adjacent": [
              3668
            ]
          },
          {
            "id": 3589,
            "name": "Waihau Bay",
            "adjacent": [
              3589,
              342
            ]
          },
          {
            "id": 568,
            "name": "Waiotahi",
            "adjacent": [
              568
            ]
          }
        ]
      },
      {
        "id": 24,
        "name": "Rotorua",
        "suburbs": [
          {
            "id": 3132,
            "name": "Atiamuri",
            "adjacent": [
              3132
            ]
          },
          {
            "id": 553,
            "name": "Awahou",
            "adjacent": [
              553
            ]
          },
          {
            "id": 3393,
            "name": "Brunswick",
            "adjacent": [
              3393
            ]
          },
          {
            "id": 3168,
            "name": "Fairy Springs",
            "adjacent": [
              3087,
              3109,
              3133,
              3168,
              3170
            ]
          },
          {
            "id": 3074,
            "name": "Fenton Park",
            "adjacent": [
              556,
              3074,
              3077,
              3083,
              3095,
              3118,
              3570
            ]
          },
          {
            "id": 3075,
            "name": "Fordlands",
            "adjacent": [
              556,
              3075,
              3083,
              3089,
              3102,
              3116,
              3133,
              3169,
              3170,
              3172,
              3206,
              3208,
              3513,
              3570,
              3786
            ]
          },
          {
            "id": 3077,
            "name": "Glenholme",
            "adjacent": [
              556,
              3074,
              3077,
              3083,
              3116,
              3134,
              3171,
              3172,
              3570
            ]
          },
          {
            "id": 554,
            "name": "Hamurana",
            "adjacent": [
              554
            ]
          },
          {
            "id": 3080,
            "name": "Hannahs Bay",
            "adjacent": [
              3080,
              3207,
              478
            ]
          },
          {
            "id": 3083,
            "name": "Hillcrest",
            "adjacent": [
              556,
              3074,
              3075,
              3077,
              3083,
              3102,
              3116,
              3134,
              3169,
              3171,
              3172,
              3206,
              3208,
              3570,
              3786
            ]
          },
          {
            "id": 3207,
            "name": "Holdens Bay",
            "adjacent": [
              3080,
              3207,
              478
            ]
          },
          {
            "id": 2909,
            "name": "Horohoro",
            "adjacent": [
              2909
            ]
          },
          {
            "id": 550,
            "name": "Kaharoa",
            "adjacent": [
              550
            ]
          },
          {
            "id": 3087,
            "name": "Kawaha Point",
            "adjacent": [
              3087,
              3089,
              3109,
              3168
            ]
          },
          {
            "id": 3089,
            "name": "Koutu",
            "adjacent": [
              556,
              3075,
              3087,
              3089,
              3109,
              3133,
              3169,
              3513
            ]
          },
          {
            "id": 563,
            "name": "Lake Okareka",
            "adjacent": [
              563,
              3605
            ]
          },
          {
            "id": 3605,
            "name": "Lake Okataina",
            "adjacent": [
              3605,
              563
            ]
          },
          {
            "id": 3489,
            "name": "Lake Rotoehu",
            "adjacent": [
              3489
            ]
          },
          {
            "id": 410,
            "name": "Lake Rotoma",
            "adjacent": [
              410
            ]
          },
          {
            "id": 415,
            "name": "Lake Tarawera",
            "adjacent": [
              415
            ]
          },
          {
            "id": 558,
            "name": "Lynmore",
            "adjacent": [
              558,
              3095,
              478
            ]
          },
          {
            "id": 2911,
            "name": "Mamaku",
            "adjacent": [
              2911
            ]
          },
          {
            "id": 3169,
            "name": "Mangakakahi",
            "adjacent": [
              556,
              3075,
              3083,
              3089,
              3102,
              3109,
              3116,
              3133,
              3169,
              3170,
              3172,
              3208,
              3513
            ]
          },
          {
            "id": 3206,
            "name": "Matipo Heights",
            "adjacent": [
              3075,
              3083,
              3102,
              3116,
              3134,
              3171,
              3172,
              3206,
              3208,
              3786
            ]
          },
          {
            "id": 555,
            "name": "Mourea",
            "adjacent": [
              555,
              2705
            ]
          },
          {
            "id": 1227,
            "name": "Ngakuru",
            "adjacent": [
              1227
            ]
          },
          {
            "id": 3095,
            "name": "Ngapuna",
            "adjacent": [
              558,
              3074,
              3095,
              478
            ]
          },
          {
            "id": 552,
            "name": "Ngongotaha",
            "adjacent": [
              552
            ]
          },
          {
            "id": 549,
            "name": "Ngongotaha Valley",
            "adjacent": [
              549
            ]
          },
          {
            "id": 3513,
            "name": "Ohinemutu",
            "adjacent": [
              556,
              3075,
              3089,
              3116,
              3169,
              3513,
              3570
            ]
          },
          {
            "id": 475,
            "name": "Okere Falls",
            "adjacent": [
              475
            ]
          },
          {
            "id": 478,
            "name": "Owhata",
            "adjacent": [
              558,
              3080,
              3095,
              3207,
              478
            ]
          },
          {
            "id": 3170,
            "name": "Pleasant Heights",
            "adjacent": [
              3075,
              3102,
              3109,
              3133,
              3168,
              3169,
              3170,
              3172,
              3208
            ]
          },
          {
            "id": 3786,
            "name": "Pomare",
            "adjacent": [
              3786,
              3075,
              3083,
              3206,
              3102,
              3134,
              3208,
              3171,
              3116,
              3172
            ]
          },
          {
            "id": 3102,
            "name": "Pukehangi",
            "adjacent": [
              3075,
              3083,
              3102,
              3116,
              3133,
              3169,
              3170,
              3172,
              3206,
              3208,
              3786
            ]
          },
          {
            "id": 991,
            "name": "Reporoa",
            "adjacent": [
              991
            ]
          },
          {
            "id": 2977,
            "name": "Rerewhakaaitu",
            "adjacent": [
              2977
            ]
          },
          {
            "id": 561,
            "name": "Rotoiti",
            "adjacent": [
              561
            ]
          },
          {
            "id": 556,
            "name": "Rotorua",
            "adjacent": [
              556,
              3074,
              3075,
              3077,
              3083,
              3089,
              3116,
              3169,
              3172,
              3208,
              3513,
              3570
            ]
          },
          {
            "id": 3109,
            "name": "Selwyn Heights",
            "adjacent": [
              3087,
              3089,
              3109,
              3133,
              3168,
              3169,
              3170
            ]
          },
          {
            "id": 3134,
            "name": "Springfield",
            "adjacent": [
              3077,
              3083,
              3116,
              3134,
              3171,
              3172,
              3206,
              3208,
              3786
            ]
          },
          {
            "id": 3208,
            "name": "Sunnybrook",
            "adjacent": [
              556,
              3075,
              3083,
              3102,
              3116,
              3133,
              3134,
              3169,
              3170,
              3171,
              3172,
              3206,
              3208,
              3786
            ]
          },
          {
            "id": 559,
            "name": "Te Ngae",
            "adjacent": [
              559,
              560
            ]
          },
          {
            "id": 3171,
            "name": "Tihiotonga",
            "adjacent": [
              3077,
              3083,
              3116,
              3118,
              3134,
              3171,
              3172,
              3206,
              3208,
              3786
            ]
          },
          {
            "id": 560,
            "name": "Tikitere",
            "adjacent": [
              559,
              560
            ]
          },
          {
            "id": 3116,
            "name": "Utuhina",
            "adjacent": [
              556,
              3075,
              3077,
              3083,
              3102,
              3116,
              3133,
              3134,
              3169,
              3171,
              3172,
              3206,
              3208,
              3513,
              3570,
              3786
            ]
          },
          {
            "id": 3570,
            "name": "Victoria",
            "adjacent": [
              3570,
              3074,
              3513,
              3075,
              556,
              3083,
              3116,
              3077
            ]
          },
          {
            "id": 3165,
            "name": "Waikite",
            "adjacent": [
              3165
            ]
          },
          {
            "id": 1228,
            "name": "Waikite Valley",
            "adjacent": [
              1228
            ]
          },
          {
            "id": 3602,
            "name": "Waiotapu",
            "adjacent": [
              3602
            ]
          },
          {
            "id": 3172,
            "name": "Westbrook",
            "adjacent": [
              556,
              3075,
              3077,
              3083,
              3102,
              3116,
              3133,
              3134,
              3169,
              3170,
              3171,
              3172,
              3206,
              3208,
              3786
            ]
          },
          {
            "id": 3133,
            "name": "Western Heights",
            "adjacent": [
              3075,
              3089,
              3102,
              3109,
              3116,
              3133,
              3168,
              3169,
              3170,
              3172,
              3208
            ]
          },
          {
            "id": 3118,
            "name": "Whakarewarewa",
            "adjacent": [
              3074,
              3118,
              3171
            ]
          }
        ]
      },
      {
        "id": 23,
        "name": "Tauranga",
        "suburbs": [
          {
            "id": 503,
            "name": "Arataki",
            "adjacent": [
              503,
              504,
              481,
              431
            ]
          },
          {
            "id": 3173,
            "name": "Avenues",
            "adjacent": [
              498,
              501,
              3173
            ]
          },
          {
            "id": 504,
            "name": "Bayfair",
            "adjacent": [
              431,
              503,
              504,
              481
            ]
          },
          {
            "id": 511,
            "name": "Bellevue",
            "adjacent": [
              429,
              498,
              510,
              511,
              512,
              513,
              3415
            ]
          },
          {
            "id": 480,
            "name": "Bethlehem",
            "adjacent": [
              429,
              497,
              480,
              581
            ]
          },
          {
            "id": 429,
            "name": "Brookfield",
            "adjacent": [
              429,
              497,
              498,
              511,
              512,
              480
            ]
          },
          {
            "id": 513,
            "name": "Bureta",
            "adjacent": [
              501,
              510,
              511,
              512,
              513,
              3415
            ]
          },
          {
            "id": 497,
            "name": "Cambridge Heights",
            "adjacent": [
              429,
              497,
              498,
              499,
              500,
              480
            ]
          },
          {
            "id": 3415,
            "name": "Cherrywood",
            "adjacent": [
              510,
              511,
              512,
              513,
              3415
            ]
          },
          {
            "id": 501,
            "name": "City Centre",
            "adjacent": [
              498,
              501,
              513,
              3173,
              482
            ]
          },
          {
            "id": 499,
            "name": "Gate Pa",
            "adjacent": [
              430,
              497,
              499,
              500,
              502,
              3390
            ]
          },
          {
            "id": 502,
            "name": "Greerton",
            "adjacent": [
              427,
              430,
              499,
              502,
              523,
              3390
            ]
          },
          {
            "id": 472,
            "name": "Hairini",
            "adjacent": [
              427,
              430,
              472,
              3799
            ]
          },
          {
            "id": 498,
            "name": "Judea",
            "adjacent": [
              429,
              497,
              498,
              501,
              511,
              3173
            ]
          },
          {
            "id": 426,
            "name": "Kairua",
            "adjacent": [
              426
            ]
          },
          {
            "id": 482,
            "name": "Matapihi",
            "adjacent": [
              428,
              482,
              501
            ]
          },
          {
            "id": 510,
            "name": "Matua",
            "adjacent": [
              510,
              511,
              512,
              513,
              3415
            ]
          },
          {
            "id": 428,
            "name": "Maungatapu",
            "adjacent": [
              428,
              474,
              482
            ]
          },
          {
            "id": 3390,
            "name": "Merivale",
            "adjacent": [
              427,
              430,
              499,
              500,
              502,
              3390
            ]
          },
          {
            "id": 3709,
            "name": "Minden",
            "adjacent": [
              3709,
              470
            ]
          },
          {
            "id": 431,
            "name": "Mount Maunganui",
            "adjacent": [
              431,
              432,
              504,
              481,
              503
            ]
          },
          {
            "id": 492,
            "name": "Ohauiti",
            "adjacent": [
              474,
              492
            ]
          },
          {
            "id": 432,
            "name": "Omanu",
            "adjacent": [
              431,
              432
            ]
          },
          {
            "id": 3559,
            "name": "Oropi",
            "adjacent": [
              3559,
              3135
            ]
          },
          {
            "id": 512,
            "name": "Otumoetai",
            "adjacent": [
              429,
              510,
              511,
              512,
              513,
              3415
            ]
          },
          {
            "id": 433,
            "name": "Papamoa",
            "adjacent": [
              433,
              435
            ]
          },
          {
            "id": 435,
            "name": "Papamoa Beach",
            "adjacent": [
              433,
              435
            ]
          },
          {
            "id": 500,
            "name": "Parkvale",
            "adjacent": [
              430,
              497,
              499,
              500,
              3390
            ]
          },
          {
            "id": 430,
            "name": "Poike",
            "adjacent": [
              427,
              430,
              499,
              500,
              502,
              3390,
              472
            ]
          },
          {
            "id": 524,
            "name": "Pyes Pa",
            "adjacent": [
              523,
              524
            ]
          },
          {
            "id": 427,
            "name": "Tauranga South",
            "adjacent": [
              427,
              430,
              502,
              3390,
              472,
              3799
            ]
          },
          {
            "id": 581,
            "name": "Tauriko",
            "adjacent": [
              581,
              480,
              3710
            ]
          },
          {
            "id": 481,
            "name": "Te Maunga",
            "adjacent": [
              431,
              503,
              504,
              481
            ]
          },
          {
            "id": 3710,
            "name": "Wairoa",
            "adjacent": [
              3710,
              581
            ]
          },
          {
            "id": 474,
            "name": "Welcome Bay",
            "adjacent": [
              428,
              474,
              492
            ]
          }
        ]
      },
      {
        "id": 22,
        "name": "Western Bay Of Plenty",
        "suburbs": [
          {
            "id": 467,
            "name": "Aongatete",
            "adjacent": [
              467
            ]
          },
          {
            "id": 3385,
            "name": "Apata",
            "adjacent": [
              3385,
              3470
            ]
          },
          {
            "id": 465,
            "name": "Athenree",
            "adjacent": [
              465,
              508
            ]
          },
          {
            "id": 466,
            "name": "Katikati",
            "adjacent": [
              466
            ]
          },
          {
            "id": 488,
            "name": "Lower Kaimai",
            "adjacent": [
              488
            ]
          },
          {
            "id": 598,
            "name": "Maketu",
            "adjacent": [
              598
            ]
          },
          {
            "id": 2912,
            "name": "Matakana Island",
            "adjacent": [
              2912
            ]
          },
          {
            "id": 3799,
            "name": "Ohauiti",
            "adjacent": [
              3799,
              472,
              427
            ]
          },
          {
            "id": 3384,
            "name": "Omanawa",
            "adjacent": [
              3384
            ]
          },
          {
            "id": 468,
            "name": "Omokoroa",
            "adjacent": [
              468
            ]
          },
          {
            "id": 3135,
            "name": "Oropi",
            "adjacent": [
              3135,
              3559
            ]
          },
          {
            "id": 495,
            "name": "Paengaroa",
            "adjacent": [
              495
            ]
          },
          {
            "id": 3470,
            "name": "Pahoia",
            "adjacent": [
              3385,
              3470
            ]
          },
          {
            "id": 601,
            "name": "Pongakawa",
            "adjacent": [
              601
            ]
          },
          {
            "id": 525,
            "name": "Pukehina",
            "adjacent": [
              525
            ]
          },
          {
            "id": 523,
            "name": "Pyes Pa",
            "adjacent": [
              502,
              523,
              524
            ]
          },
          {
            "id": 600,
            "name": "Rangiuru",
            "adjacent": [
              600
            ]
          },
          {
            "id": 3842,
            "name": "Tahawai",
            "adjacent": [
              3842
            ]
          },
          {
            "id": 3620,
            "name": "Tanners Point",
            "adjacent": [
              3620
            ]
          },
          {
            "id": 494,
            "name": "Te Puke",
            "adjacent": [
              494
            ]
          },
          {
            "id": 470,
            "name": "Te Puna",
            "adjacent": [
              470,
              3709
            ]
          },
          {
            "id": 508,
            "name": "Waihi Beach",
            "adjacent": [
              508,
              465
            ]
          },
          {
            "id": 469,
            "name": "Whakamarama",
            "adjacent": [
              469
            ]
          }
        ]
      },
      {
        "id": 25,
        "name": "Whakatane",
        "suburbs": [
          {
            "id": 542,
            "name": "Awakaponga",
            "adjacent": [
              542
            ]
          },
          {
            "id": 516,
            "name": "Awakeri",
            "adjacent": [
              516
            ]
          },
          {
            "id": 464,
            "name": "Coastlands",
            "adjacent": [
              464
            ]
          },
          {
            "id": 544,
            "name": "Edgecumbe",
            "adjacent": [
              544
            ]
          },
          {
            "id": 417,
            "name": "Galatea",
            "adjacent": [
              417
            ]
          },
          {
            "id": 3734,
            "name": "Manawahe",
            "adjacent": [
              3734
            ]
          },
          {
            "id": 541,
            "name": "Matata",
            "adjacent": [
              541
            ]
          },
          {
            "id": 418,
            "name": "Murupara",
            "adjacent": [
              418
            ]
          },
          {
            "id": 3837,
            "name": "Nukuhou North",
            "adjacent": [
              3837
            ]
          },
          {
            "id": 520,
            "name": "Ohope",
            "adjacent": [
              520,
              522
            ]
          },
          {
            "id": 440,
            "name": "Onepu",
            "adjacent": [
              440
            ]
          },
          {
            "id": 543,
            "name": "Otakiri",
            "adjacent": [
              543
            ]
          },
          {
            "id": 518,
            "name": "Pahou",
            "adjacent": [
              518
            ]
          },
          {
            "id": 515,
            "name": "Paroa",
            "adjacent": [
              515
            ]
          },
          {
            "id": 528,
            "name": "Pikowai",
            "adjacent": [
              528
            ]
          },
          {
            "id": 517,
            "name": "Poroporo",
            "adjacent": [
              517
            ]
          },
          {
            "id": 522,
            "name": "Port Ohope",
            "adjacent": [
              520,
              522
            ]
          },
          {
            "id": 450,
            "name": "Ruatoki North",
            "adjacent": [
              450
            ]
          },
          {
            "id": 521,
            "name": "Taneatua",
            "adjacent": [
              521
            ]
          },
          {
            "id": 441,
            "name": "Te Teko",
            "adjacent": [
              441
            ]
          },
          {
            "id": 514,
            "name": "Thornton",
            "adjacent": [
              514
            ]
          },
          {
            "id": 449,
            "name": "Waimana",
            "adjacent": [
              449
            ]
          },
          {
            "id": 3675,
            "name": "Wainui",
            "adjacent": [
              3675
            ]
          },
          {
            "id": 519,
            "name": "Whakatane",
            "adjacent": [
              519
            ]
          }
        ]
      }
    ]
  },
  {
    "id": 4,
    "name": "Gisborne",
    "districts": [
      {
        "id": 28,
        "name": "Gisborne",
        "suburbs": [
          {
            "id": 1189,
            "name": "Awapuni",
            "adjacent": [
              1756,
              1189,
              1516,
              1608
            ]
          },
          {
            "id": 1056,
            "name": "City Centre",
            "adjacent": [
              1026,
              1027,
              1028,
              1191,
              3320,
              1056,
              1057
            ]
          },
          {
            "id": 1058,
            "name": "Elgin",
            "adjacent": [
              1190,
              1057,
              1058
            ]
          },
          {
            "id": 1068,
            "name": "Hangaroa",
            "adjacent": [
              1068
            ]
          },
          {
            "id": 1285,
            "name": "Hexton",
            "adjacent": [
              1285,
              1287
            ]
          },
          {
            "id": 1162,
            "name": "Hicks Bay",
            "adjacent": [
              1162
            ]
          },
          {
            "id": 3320,
            "name": "Inner Kaiti",
            "adjacent": [
              1026,
              1027,
              1028,
              1168,
              3320,
              1056
            ]
          },
          {
            "id": 1028,
            "name": "Kaiti",
            "adjacent": [
              1026,
              1027,
              1028,
              1168,
              3320,
              1056
            ]
          },
          {
            "id": 3698,
            "name": "Lytton West",
            "adjacent": [
              3698,
              1191,
              1190,
              1057
            ]
          },
          {
            "id": 3317,
            "name": "Makaraka ",
            "adjacent": [
              3317
            ]
          },
          {
            "id": 1287,
            "name": "Makauri",
            "adjacent": [
              1285,
              1287
            ]
          },
          {
            "id": 3632,
            "name": "Makorori",
            "adjacent": [
              3632
            ]
          },
          {
            "id": 1191,
            "name": "Mangapapa",
            "adjacent": [
              1026,
              1190,
              1191,
              1056,
              1057,
              3698
            ]
          },
          {
            "id": 1155,
            "name": "Manutuke",
            "adjacent": [
              1155
            ]
          },
          {
            "id": 586,
            "name": "Matawai",
            "adjacent": [
              586
            ]
          },
          {
            "id": 1288,
            "name": "Matawhero",
            "adjacent": [
              1288,
              3715,
              3731
            ]
          },
          {
            "id": 3495,
            "name": "Matokitoki",
            "adjacent": [
              3495
            ]
          },
          {
            "id": 374,
            "name": "Motu",
            "adjacent": [
              374
            ]
          },
          {
            "id": 1156,
            "name": "Muriwai",
            "adjacent": [
              1156
            ]
          },
          {
            "id": 1293,
            "name": "Ngatapa",
            "adjacent": [
              1293
            ]
          },
          {
            "id": 1309,
            "name": "Okitu",
            "adjacent": [
              1309,
              1336
            ]
          },
          {
            "id": 1196,
            "name": "Ormond",
            "adjacent": [
              1196
            ]
          },
          {
            "id": 1158,
            "name": "Otoko",
            "adjacent": [
              1158
            ]
          },
          {
            "id": 1027,
            "name": "Outer Kaiti",
            "adjacent": [
              1026,
              1027,
              1028,
              1168,
              3320,
              1056
            ]
          },
          {
            "id": 1286,
            "name": "Patutahi",
            "adjacent": [
              1286
            ]
          },
          {
            "id": 3693,
            "name": "Pehiri",
            "adjacent": [
              3693
            ]
          },
          {
            "id": 1166,
            "name": "Pouawa",
            "adjacent": [
              1166
            ]
          },
          {
            "id": 3695,
            "name": "Raukumara",
            "adjacent": [
              3695
            ]
          },
          {
            "id": 1065,
            "name": "Rere",
            "adjacent": [
              1065
            ]
          },
          {
            "id": 1190,
            "name": "Riverdale",
            "adjacent": [
              1190,
              1191,
              1057,
              1058,
              3698
            ]
          },
          {
            "id": 1169,
            "name": "Ruatoria",
            "adjacent": [
              1169
            ]
          },
          {
            "id": 3725,
            "name": "Tahunga",
            "adjacent": [
              3725
            ]
          },
          {
            "id": 1168,
            "name": "Tamarau",
            "adjacent": [
              1027,
              1028,
              1168,
              3320,
              1336
            ]
          },
          {
            "id": 3804,
            "name": "Te Araroa",
            "adjacent": [
              3804
            ]
          },
          {
            "id": 1057,
            "name": "Te Hapara",
            "adjacent": [
              1190,
              1191,
              1056,
              1057,
              1058,
              3698
            ]
          },
          {
            "id": 1290,
            "name": "Te Karaka",
            "adjacent": [
              1290
            ]
          },
          {
            "id": 1097,
            "name": "Tiniroto",
            "adjacent": [
              1097
            ]
          },
          {
            "id": 2663,
            "name": "Tokomaru Bay",
            "adjacent": [
              2663
            ]
          },
          {
            "id": 2643,
            "name": "Tolaga Bay",
            "adjacent": [
              2643
            ]
          },
          {
            "id": 3715,
            "name": "Waerengaahika",
            "adjacent": [
              3715,
              1288,
              3731
            ]
          },
          {
            "id": 1069,
            "name": "Waerengaokuri",
            "adjacent": [
              1069
            ]
          },
          {
            "id": 342,
            "name": "Waihau Bay",
            "adjacent": [
              342,
              3589
            ]
          },
          {
            "id": 734,
            "name": "Waimata",
            "adjacent": [
              734
            ]
          },
          {
            "id": 1098,
            "name": "Waingake",
            "adjacent": [
              1098
            ]
          },
          {
            "id": 1336,
            "name": "Wainui",
            "adjacent": [
              1168,
              1309,
              1336
            ]
          },
          {
            "id": 1271,
            "name": "Waipaoa",
            "adjacent": [
              1271
            ]
          },
          {
            "id": 3731,
            "name": "Waituhi",
            "adjacent": [
              3731,
              1288,
              3715
            ]
          },
          {
            "id": 1167,
            "name": "Whangara",
            "adjacent": [
              1167
            ]
          },
          {
            "id": 1036,
            "name": "Wharekopae",
            "adjacent": [
              1036
            ]
          },
          {
            "id": 3600,
            "name": "Wharerata",
            "adjacent": [
              3600
            ]
          },
          {
            "id": 1292,
            "name": "Whatatutu",
            "adjacent": [
              1292
            ]
          },
          {
            "id": 1026,
            "name": "Whataupoko",
            "adjacent": [
              1026,
              1027,
              1028,
              1191,
              3320,
              1056
            ]
          }
        ]
      }
    ]
  },
  {
    "id": 5,
    "name": "Hawke's Bay",
    "districts": [
      {
        "id": 32,
        "name": "Central Hawke's Bay",
        "suburbs": [
          {
            "id": 3820,
            "name": "Aramoana",
            "adjacent": [
              3820
            ]
          },
          {
            "id": 3505,
            "name": "Central Hawke's Bay Country",
            "adjacent": [
              3505
            ]
          },
          {
            "id": 3072,
            "name": "Elsthorpe",
            "adjacent": [
              3072
            ]
          },
          {
            "id": 3612,
            "name": "Flemington",
            "adjacent": [
              3612
            ]
          },
          {
            "id": 3649,
            "name": "Hatuma",
            "adjacent": [
              3649
            ]
          },
          {
            "id": 3718,
            "name": "Maraetotara",
            "adjacent": [
              3718
            ]
          },
          {
            "id": 3740,
            "name": "Omakere",
            "adjacent": [
              3740
            ]
          },
          {
            "id": 1335,
            "name": "Ongaonga",
            "adjacent": [
              1335
            ]
          },
          {
            "id": 3098,
            "name": "Otane",
            "adjacent": [
              3098
            ]
          },
          {
            "id": 1277,
            "name": "Patangata",
            "adjacent": [
              1263,
              1277
            ]
          },
          {
            "id": 3175,
            "name": "Porangahau",
            "adjacent": [
              3175
            ]
          },
          {
            "id": 3758,
            "name": "Pourerere",
            "adjacent": [
              3758
            ]
          },
          {
            "id": 1310,
            "name": "Takapau",
            "adjacent": [
              1310
            ]
          },
          {
            "id": 1275,
            "name": "Tikokino",
            "adjacent": [
              1275
            ]
          },
          {
            "id": 1282,
            "name": "Waipawa",
            "adjacent": [
              1282
            ]
          },
          {
            "id": 1274,
            "name": "Waipukurau",
            "adjacent": [
              1274
            ]
          },
          {
            "id": 1313,
            "name": "Wanstead",
            "adjacent": [
              1313
            ]
          }
        ]
      },
      {
        "id": 30,
        "name": "Hastings",
        "suburbs": [
          {
            "id": 1208,
            "name": "Akina",
            "adjacent": [
              1202,
              1203,
              1204,
              3058,
              3092,
              1207,
              1208
            ]
          },
          {
            "id": 1072,
            "name": "Bridge Pa",
            "adjacent": [
              1072,
              1232,
              3596
            ]
          },
          {
            "id": 1229,
            "name": "Camberley",
            "adjacent": [
              1202,
              1203,
              3374,
              1206,
              1229,
              3807
            ]
          },
          {
            "id": 958,
            "name": "Clive",
            "adjacent": [
              958
            ]
          },
          {
            "id": 3070,
            "name": "Crownthorpe",
            "adjacent": [
              3070
            ]
          },
          {
            "id": 3073,
            "name": "Eskdale",
            "adjacent": [
              3073
            ]
          },
          {
            "id": 3062,
            "name": "Fernhill",
            "adjacent": [
              3062,
              3096
            ]
          },
          {
            "id": 1232,
            "name": "Flaxmere",
            "adjacent": [
              1072,
              1232,
              3807
            ]
          },
          {
            "id": 1206,
            "name": "Frimley",
            "adjacent": [
              1201,
              1202,
              1203,
              3374,
              1206,
              1229,
              3807
            ]
          },
          {
            "id": 3058,
            "name": "Hastings Central",
            "adjacent": [
              1201,
              1202,
              1203,
              1204,
              3058,
              3374,
              1207,
              1208
            ]
          },
          {
            "id": 1137,
            "name": "Haumoana",
            "adjacent": [
              1137
            ]
          },
          {
            "id": 959,
            "name": "Havelock North",
            "adjacent": [
              959
            ]
          },
          {
            "id": 3346,
            "name": "Kahuranaki",
            "adjacent": [
              3346
            ]
          },
          {
            "id": 1231,
            "name": "Karamu",
            "adjacent": [
              1204,
              1205,
              3334,
              1230,
              1231
            ]
          },
          {
            "id": 1250,
            "name": "Kereru",
            "adjacent": [
              1250
            ]
          },
          {
            "id": 3092,
            "name": "Longlands",
            "adjacent": [
              1203,
              3092,
              1208
            ]
          },
          {
            "id": 1201,
            "name": "Mahora",
            "adjacent": [
              1201,
              1202,
              1204,
              1205,
              3058,
              3374,
              1206
            ]
          },
          {
            "id": 3333,
            "name": "Mangatahi",
            "adjacent": [
              3333
            ]
          },
          {
            "id": 3334,
            "name": "Mangateretere",
            "adjacent": [
              3131,
              3334,
              1230,
              1231
            ]
          },
          {
            "id": 1140,
            "name": "Maraekakaho",
            "adjacent": [
              1140
            ]
          },
          {
            "id": 1204,
            "name": "Mayfair",
            "adjacent": [
              1201,
              1202,
              1204,
              1205,
              3058,
              1207,
              1208,
              1230,
              1231
            ]
          },
          {
            "id": 1251,
            "name": "Moteo",
            "adjacent": [
              1251
            ]
          },
          {
            "id": 3096,
            "name": "Omahu",
            "adjacent": [
              3062,
              3096
            ]
          },
          {
            "id": 3335,
            "name": "Otamauri",
            "adjacent": [
              3335
            ]
          },
          {
            "id": 1139,
            "name": "Pakipaki",
            "adjacent": [
              1139
            ]
          },
          {
            "id": 3337,
            "name": "Pakowhai",
            "adjacent": [
              3337
            ]
          },
          {
            "id": 1207,
            "name": "Parkvale",
            "adjacent": [
              1204,
              3058,
              1207,
              1208
            ]
          },
          {
            "id": 1263,
            "name": "Patangata",
            "adjacent": [
              1263,
              1277
            ]
          },
          {
            "id": 1009,
            "name": "Patoka",
            "adjacent": [
              1009
            ]
          },
          {
            "id": 1142,
            "name": "Poukawa",
            "adjacent": [
              1142
            ]
          },
          {
            "id": 3220,
            "name": "Puketapu",
            "adjacent": [
              3220
            ]
          },
          {
            "id": 3103,
            "name": "Puketitiri",
            "adjacent": [
              3103
            ]
          },
          {
            "id": 3336,
            "name": "Putorino",
            "adjacent": [
              3336
            ]
          },
          {
            "id": 3222,
            "name": "Raukawa",
            "adjacent": [
              3222
            ]
          },
          {
            "id": 1203,
            "name": "Raureka",
            "adjacent": [
              1202,
              1203,
              3058,
              3092,
              3374,
              1206,
              1208,
              1229
            ]
          },
          {
            "id": 1008,
            "name": "Rissington",
            "adjacent": [
              1008
            ]
          },
          {
            "id": 3596,
            "name": "Roys Hill",
            "adjacent": [
              3596,
              1072
            ]
          },
          {
            "id": 1202,
            "name": "Saint Leonards",
            "adjacent": [
              1201,
              1202,
              1203,
              1204,
              3058,
              3374,
              1206,
              1208,
              1229
            ]
          },
          {
            "id": 1112,
            "name": "Sherenden",
            "adjacent": [
              1112
            ]
          },
          {
            "id": 3374,
            "name": "Stortford Lodge",
            "adjacent": [
              1201,
              1202,
              1203,
              3058,
              3374,
              1206,
              1229,
              3807
            ]
          },
          {
            "id": 3338,
            "name": "Tangoio",
            "adjacent": [
              3338
            ]
          },
          {
            "id": 3115,
            "name": "Te Awanga",
            "adjacent": [
              3115
            ]
          },
          {
            "id": 3339,
            "name": "Te Hauke",
            "adjacent": [
              3339
            ]
          },
          {
            "id": 983,
            "name": "Te Pohue",
            "adjacent": [
              983
            ]
          },
          {
            "id": 1205,
            "name": "Tomoana",
            "adjacent": [
              1201,
              1204,
              1205,
              1230,
              1231
            ]
          },
          {
            "id": 3792,
            "name": "Tuki Tuki",
            "adjacent": [
              3792
            ]
          },
          {
            "id": 982,
            "name": "Tutira",
            "adjacent": [
              982
            ]
          },
          {
            "id": 1073,
            "name": "Twyford",
            "adjacent": [
              1073
            ]
          },
          {
            "id": 1141,
            "name": "Waimarama",
            "adjacent": [
              1141
            ]
          },
          {
            "id": 3720,
            "name": "Waiohiki",
            "adjacent": [
              3720
            ]
          },
          {
            "id": 1230,
            "name": "Waipatu",
            "adjacent": [
              1204,
              1205,
              3334,
              1230,
              1231
            ]
          },
          {
            "id": 3366,
            "name": "Waiwhare",
            "adjacent": [
              3366
            ]
          },
          {
            "id": 3131,
            "name": "Whakatu",
            "adjacent": [
              3131,
              3334
            ]
          },
          {
            "id": 3557,
            "name": "Whanawhana",
            "adjacent": [
              3557
            ]
          },
          {
            "id": 984,
            "name": "Whirinaki",
            "adjacent": [
              984
            ]
          },
          {
            "id": 3807,
            "name": "Woolwich",
            "adjacent": [
              3807,
              1229,
              1232,
              1206,
              3374
            ]
          }
        ]
      },
      {
        "id": 31,
        "name": "Napier",
        "suburbs": [
          {
            "id": 1076,
            "name": "Ahuriri",
            "adjacent": [
              572,
              1053,
              1075,
              1076,
              1077,
              3797,
              3821
            ]
          },
          {
            "id": 1562,
            "name": "Awatoto",
            "adjacent": [
              1562
            ]
          },
          {
            "id": 962,
            "name": "Bay View",
            "adjacent": [
              962
            ]
          },
          {
            "id": 1075,
            "name": "Bluff Hill",
            "adjacent": [
              572,
              3176,
              1075,
              1076,
              1077,
              3797,
              3821
            ]
          },
          {
            "id": 1154,
            "name": "City Centre",
            "adjacent": [
              1561,
              572,
              3100,
              3176,
              3443,
              1077,
              1078,
              1149,
              1154,
              3821
            ]
          },
          {
            "id": 1129,
            "name": "Greenmeadows",
            "adjacent": [
              945,
              3100,
              1128,
              1129,
              1130,
              3507
            ]
          },
          {
            "id": 1077,
            "name": "Hospital Hill",
            "adjacent": [
              572,
              3176,
              1075,
              1076,
              1077,
              1078,
              1154,
              3797,
              3821
            ]
          },
          {
            "id": 3507,
            "name": "Jervoistown",
            "adjacent": [
              1563,
              945,
              1129,
              3507
            ]
          },
          {
            "id": 1561,
            "name": "Maraenui",
            "adjacent": [
              1561,
              3100,
              3176,
              3443,
              1078,
              1149,
              1154
            ]
          },
          {
            "id": 1078,
            "name": "Marewa",
            "adjacent": [
              1561,
              572,
              3176,
              3443,
              1077,
              1078,
              1149,
              1154,
              3797
            ]
          },
          {
            "id": 1563,
            "name": "Meeanee",
            "adjacent": [
              1563,
              3507
            ]
          },
          {
            "id": 1130,
            "name": "Mission View",
            "adjacent": [
              945,
              3101,
              1128,
              1129,
              1130,
              3796
            ]
          },
          {
            "id": 3176,
            "name": "Napier South",
            "adjacent": [
              1561,
              572,
              3176,
              3443,
              1075,
              1077,
              1078,
              1149,
              1154,
              3797
            ]
          },
          {
            "id": 1149,
            "name": "Onekawa",
            "adjacent": [
              1561,
              3100,
              3176,
              3443,
              1078,
              1128,
              1149,
              1154
            ]
          },
          {
            "id": 3821,
            "name": "Pandora",
            "adjacent": [
              3821,
              572,
              1076,
              1075,
              1154,
              1077,
              1053
            ]
          },
          {
            "id": 3100,
            "name": "Pirimai",
            "adjacent": [
              1561,
              3100,
              1128,
              1129,
              1149,
              1154
            ]
          },
          {
            "id": 3101,
            "name": "Poraiti",
            "adjacent": [
              3101,
              1128,
              1130
            ]
          },
          {
            "id": 3563,
            "name": "Pukehamoamoa",
            "adjacent": [
              3563
            ]
          },
          {
            "id": 1128,
            "name": "Tamatea",
            "adjacent": [
              3100,
              3101,
              1128,
              1129,
              1130,
              1149
            ]
          },
          {
            "id": 945,
            "name": "Taradale",
            "adjacent": [
              945,
              1129,
              1130,
              3507,
              3796
            ]
          },
          {
            "id": 3443,
            "name": "Te Awa",
            "adjacent": [
              1561,
              3176,
              3443,
              1078,
              1149,
              1154
            ]
          },
          {
            "id": 1053,
            "name": "Westshore",
            "adjacent": [
              1053,
              1076,
              3821
            ]
          }
        ]
      },
      {
        "id": 29,
        "name": "Wairoa",
        "suburbs": [
          {
            "id": 904,
            "name": "Frasertown",
            "adjacent": [
              904,
              3481
            ]
          },
          {
            "id": 3332,
            "name": "Kotemaori",
            "adjacent": [
              3332
            ]
          },
          {
            "id": 3397,
            "name": "Mahanga",
            "adjacent": [
              3397
            ]
          },
          {
            "id": 3367,
            "name": "Mahia",
            "adjacent": [
              3367,
              1339
            ]
          },
          {
            "id": 1339,
            "name": "Mahia Beach",
            "adjacent": [
              1339,
              3367
            ]
          },
          {
            "id": 3481,
            "name": "Marumaru",
            "adjacent": [
              904,
              3481
            ]
          },
          {
            "id": 3355,
            "name": "Mohaka",
            "adjacent": [
              3355
            ]
          },
          {
            "id": 3252,
            "name": "Morere",
            "adjacent": [
              3252
            ]
          },
          {
            "id": 968,
            "name": "Nuhaka",
            "adjacent": [
              968
            ]
          },
          {
            "id": 1119,
            "name": "Ruakituri",
            "adjacent": [
              1119
            ]
          },
          {
            "id": 3480,
            "name": "Te Reinga",
            "adjacent": [
              3480
            ]
          },
          {
            "id": 1338,
            "name": "Tuai",
            "adjacent": [
              1338
            ]
          },
          {
            "id": 1296,
            "name": "Wairoa",
            "adjacent": [
              1296
            ]
          },
          {
            "id": 903,
            "name": "Whakaki",
            "adjacent": [
              903
            ]
          }
        ]
      }
    ]
  },
  {
    "id": 12,
    "name": "Taranaki",
    "districts": [
      {
        "id": 33,
        "name": "New Plymouth",
        "suburbs": [
          {
            "id": 926,
            "name": "Bell Block",
            "adjacent": [
              926
            ]
          },
          {
            "id": 3290,
            "name": "Blagdon",
            "adjacent": [
              1041,
              3084,
              3212,
              3261,
              1042,
              1144,
              1224,
              3290
            ]
          },
          {
            "id": 1395,
            "name": "Brixton",
            "adjacent": [
              917,
              1395
            ]
          },
          {
            "id": 1175,
            "name": "Brooklands",
            "adjacent": [
              1173,
              1174,
              1175,
              1248,
              2026,
              3117,
              3194,
              3382,
              1043,
              1144,
              1225
            ]
          },
          {
            "id": 1225,
            "name": "City Centre",
            "adjacent": [
              1174,
              1175,
              1248,
              3117,
              3382,
              1144,
              1225,
              1245,
              1246
            ]
          },
          {
            "id": 1121,
            "name": "Egmont Village",
            "adjacent": [
              1121
            ]
          },
          {
            "id": 2026,
            "name": "Ferndale",
            "adjacent": [
              1041,
              1174,
              1175,
              2026,
              3084,
              3212,
              1043,
              1144,
              3729
            ]
          },
          {
            "id": 1246,
            "name": "Fitzroy",
            "adjacent": [
              1247,
              1248,
              3117,
              1225,
              1245,
              1246,
              3625
            ]
          },
          {
            "id": 1043,
            "name": "Frankleigh Park",
            "adjacent": [
              1174,
              1175,
              2026,
              3084,
              3212,
              1043,
              1144,
              3729
            ]
          },
          {
            "id": 1247,
            "name": "Glen Avon",
            "adjacent": [
              1247,
              1248,
              3117,
              1246,
              3625
            ]
          },
          {
            "id": 1173,
            "name": "Highlands Park",
            "adjacent": [
              1173,
              1174,
              1175,
              1248,
              3117,
              3194
            ]
          },
          {
            "id": 918,
            "name": "Hillsborough",
            "adjacent": [
              918
            ]
          },
          {
            "id": 3084,
            "name": "Hurdon",
            "adjacent": [
              1041,
              2026,
              3084,
              3212,
              1042,
              1043,
              1144,
              3290
            ]
          },
          {
            "id": 3873,
            "name": "Hurford",
            "adjacent": [
              3873,
              3533
            ]
          },
          {
            "id": 919,
            "name": "Hurworth",
            "adjacent": [
              919,
              3729
            ]
          },
          {
            "id": 1122,
            "name": "Inglewood",
            "adjacent": [
              1122
            ]
          },
          {
            "id": 3802,
            "name": "Korito",
            "adjacent": [
              3802
            ]
          },
          {
            "id": 3533,
            "name": "Koru",
            "adjacent": [
              3533,
              3873
            ]
          },
          {
            "id": 917,
            "name": "Lepperton",
            "adjacent": [
              917,
              1395
            ]
          },
          {
            "id": 3261,
            "name": "Lynmouth",
            "adjacent": [
              3212,
              3261,
              3382,
              1042,
              1144,
              1224,
              3290
            ]
          },
          {
            "id": 3194,
            "name": "Mangorei",
            "adjacent": [
              1173,
              1175,
              3194
            ]
          },
          {
            "id": 3212,
            "name": "Marfell",
            "adjacent": [
              1041,
              2026,
              3084,
              3212,
              3261,
              1042,
              1043,
              1144,
              1224,
              3290
            ]
          },
          {
            "id": 1248,
            "name": "Merrilands",
            "adjacent": [
              1173,
              1175,
              1247,
              1248,
              3117,
              3382,
              1225,
              1245,
              1246,
              3625
            ]
          },
          {
            "id": 1315,
            "name": "Mokau",
            "adjacent": [
              1315
            ]
          },
          {
            "id": 1224,
            "name": "Moturoa",
            "adjacent": [
              1041,
              3212,
              3261,
              1042,
              1224,
              3290
            ]
          },
          {
            "id": 3382,
            "name": "New Plymouth",
            "adjacent": [
              1174,
              1175,
              1248,
              3117,
              3261,
              3382,
              1144,
              1225,
              1245
            ]
          },
          {
            "id": 3631,
            "name": "Norfolk",
            "adjacent": [
              3631
            ]
          },
          {
            "id": 1325,
            "name": "Oakura",
            "adjacent": [
              1325
            ]
          },
          {
            "id": 1074,
            "name": "Okato",
            "adjacent": [
              1074
            ]
          },
          {
            "id": 1537,
            "name": "Omata",
            "adjacent": [
              1537
            ]
          },
          {
            "id": 1392,
            "name": "Onaero",
            "adjacent": [
              1392
            ]
          },
          {
            "id": 3884,
            "name": "Pitone",
            "adjacent": [
              3884
            ]
          },
          {
            "id": 3729,
            "name": "Ridgewood",
            "adjacent": [
              3729,
              2026,
              1043,
              919
            ]
          },
          {
            "id": 3242,
            "name": "Royal Heights",
            "adjacent": [
              245,
              246,
              255,
              3255,
              3257,
              3392,
              3242,
              223
            ]
          },
          {
            "id": 3879,
            "name": "Sentry Hill",
            "adjacent": [
              3879
            ]
          },
          {
            "id": 1042,
            "name": "Spotswood",
            "adjacent": [
              1041,
              3084,
              3212,
              3261,
              1042,
              1224,
              3290
            ]
          },
          {
            "id": 1245,
            "name": "Strandon",
            "adjacent": [
              1248,
              3117,
              3382,
              1225,
              1245,
              1246
            ]
          },
          {
            "id": 1145,
            "name": "Tariki",
            "adjacent": [
              1145
            ]
          },
          {
            "id": 3195,
            "name": "Tikorangi",
            "adjacent": [
              3195
            ]
          },
          {
            "id": 3660,
            "name": "Tongaporutu",
            "adjacent": [
              3660
            ]
          },
          {
            "id": 954,
            "name": "Urenui",
            "adjacent": [
              954
            ]
          },
          {
            "id": 3723,
            "name": "Uruti",
            "adjacent": [
              3723
            ]
          },
          {
            "id": 1174,
            "name": "Vogeltown",
            "adjacent": [
              1173,
              1174,
              1175,
              2026,
              3117,
              3382,
              1043,
              1144,
              1225
            ]
          },
          {
            "id": 1394,
            "name": "Waitara",
            "adjacent": [
              1394
            ]
          },
          {
            "id": 3625,
            "name": "Waiwhakaiho",
            "adjacent": [
              3625,
              1246,
              1247,
              1248
            ]
          },
          {
            "id": 3117,
            "name": "Welbourn",
            "adjacent": [
              1173,
              1174,
              1175,
              1247,
              1248,
              3117,
              3382,
              1225,
              1245,
              1246
            ]
          },
          {
            "id": 1144,
            "name": "Westown",
            "adjacent": [
              1041,
              1174,
              1175,
              2026,
              3084,
              3212,
              3261,
              3382,
              1043,
              1144,
              1225,
              3290
            ]
          },
          {
            "id": 1041,
            "name": "Whalers Gate",
            "adjacent": [
              1041,
              2026,
              3084,
              3212,
              1042,
              1144,
              1224,
              3290
            ]
          }
        ]
      },
      {
        "id": 35,
        "name": "South Taranaki",
        "suburbs": [
          {
            "id": 1032,
            "name": "Alton",
            "adjacent": [
              1032
            ]
          },
          {
            "id": 3785,
            "name": "Auroa",
            "adjacent": [
              3785
            ]
          },
          {
            "id": 3582,
            "name": "Awatuna",
            "adjacent": [
              3582,
              3581,
              772
            ]
          },
          {
            "id": 1177,
            "name": "Eltham",
            "adjacent": [
              1177
            ]
          },
          {
            "id": 1125,
            "name": "Hawera",
            "adjacent": [
              1125
            ]
          },
          {
            "id": 772,
            "name": "Kaponga",
            "adjacent": [
              772,
              3582
            ]
          },
          {
            "id": 2522,
            "name": "Manaia",
            "adjacent": [
              2522
            ]
          },
          {
            "id": 3694,
            "name": "Mokoia",
            "adjacent": [
              3694
            ]
          },
          {
            "id": 1238,
            "name": "Normanby",
            "adjacent": [
              1238
            ]
          },
          {
            "id": 3773,
            "name": "Ohawe",
            "adjacent": [
              3773,
              1503
            ]
          },
          {
            "id": 2523,
            "name": "Okaiawa",
            "adjacent": [
              2523
            ]
          },
          {
            "id": 1358,
            "name": "Opunake",
            "adjacent": [
              1358
            ]
          },
          {
            "id": 3867,
            "name": "Otakeho",
            "adjacent": [
              3867
            ]
          },
          {
            "id": 1033,
            "name": "Patea",
            "adjacent": [
              1033
            ]
          },
          {
            "id": 2561,
            "name": "Pungarehu",
            "adjacent": [
              2561
            ]
          },
          {
            "id": 3581,
            "name": "Te Kiri",
            "adjacent": [
              3581,
              3582
            ]
          },
          {
            "id": 1503,
            "name": "Tokaora",
            "adjacent": [
              1503,
              3773
            ]
          },
          {
            "id": 1171,
            "name": "Waitotara",
            "adjacent": [
              1171
            ]
          },
          {
            "id": 1253,
            "name": "Warea",
            "adjacent": [
              1253
            ]
          },
          {
            "id": 1034,
            "name": "Waverley",
            "adjacent": [
              1034
            ]
          }
        ]
      },
      {
        "id": 34,
        "name": "Stratford",
        "suburbs": [
          {
            "id": 1146,
            "name": "Midhurst",
            "adjacent": [
              1146
            ]
          },
          {
            "id": 3368,
            "name": "Stratford",
            "adjacent": [
              1254,
              1255,
              3368
            ]
          },
          {
            "id": 1254,
            "name": "Stratford East",
            "adjacent": [
              1254,
              1255,
              3368
            ]
          },
          {
            "id": 1255,
            "name": "Stratford West",
            "adjacent": [
              1254,
              1255,
              3368
            ]
          },
          {
            "id": 1147,
            "name": "Toko",
            "adjacent": [
              1147
            ]
          }
        ]
      }
    ]
  },
  {
    "id": 6,
    "name": "Manawatu / Whanganui",
    "districts": [
      {
        "id": 42,
        "name": "Horowhenua",
        "suburbs": [
          {
            "id": 1390,
            "name": "Foxton",
            "adjacent": [
              1390
            ]
          },
          {
            "id": 1391,
            "name": "Foxton Beach",
            "adjacent": [
              1391
            ]
          },
          {
            "id": 1598,
            "name": "Heatherlea",
            "adjacent": [
              1598
            ]
          },
          {
            "id": 948,
            "name": "Hokio Beach",
            "adjacent": [
              948
            ]
          },
          {
            "id": 1361,
            "name": "Ihakara",
            "adjacent": [
              1361,
              1050
            ]
          },
          {
            "id": 3798,
            "name": "Koputaroa",
            "adjacent": [
              3798
            ]
          },
          {
            "id": 2639,
            "name": "Kuku",
            "adjacent": [
              2639
            ]
          },
          {
            "id": 1051,
            "name": "Levin",
            "adjacent": [
              1051
            ]
          },
          {
            "id": 3061,
            "name": "Manakau",
            "adjacent": [
              3061
            ]
          },
          {
            "id": 1050,
            "name": "Muhunoa East",
            "adjacent": [
              1361,
              1050
            ]
          },
          {
            "id": 1049,
            "name": "Ohau",
            "adjacent": [
              1049
            ]
          },
          {
            "id": 3343,
            "name": "Opiki",
            "adjacent": [
              3343
            ]
          },
          {
            "id": 1362,
            "name": "Shannon",
            "adjacent": [
              1362
            ]
          },
          {
            "id": 1364,
            "name": "Tokomaru",
            "adjacent": [
              1364
            ]
          },
          {
            "id": 3440,
            "name": "Waikawa Beach",
            "adjacent": [
              3440
            ]
          },
          {
            "id": 1597,
            "name": "Waitarere",
            "adjacent": [
              1597,
              3569
            ]
          },
          {
            "id": 3569,
            "name": "Waitarere Beach",
            "adjacent": [
              3569,
              1597
            ]
          }
        ]
      },
      {
        "id": 39,
        "name": "Manawatu",
        "suburbs": [
          {
            "id": 3791,
            "name": "Aorangi",
            "adjacent": [
              3791
            ]
          },
          {
            "id": 3321,
            "name": "Apiti",
            "adjacent": [
              3321
            ]
          },
          {
            "id": 3288,
            "name": "Awahuri",
            "adjacent": [
              3288
            ]
          },
          {
            "id": 107,
            "name": "Cheltenham",
            "adjacent": [
              107
            ]
          },
          {
            "id": 3287,
            "name": "Colyton",
            "adjacent": [
              3287
            ]
          },
          {
            "id": 1411,
            "name": "Feilding",
            "adjacent": [
              1411
            ]
          },
          {
            "id": 3833,
            "name": "Glen Oroua",
            "adjacent": [
              3833,
              1648
            ]
          },
          {
            "id": 1409,
            "name": "Halcombe",
            "adjacent": [
              1409
            ]
          },
          {
            "id": 1638,
            "name": "Highbury",
            "adjacent": [
              1638
            ]
          },
          {
            "id": 1816,
            "name": "Himatangi",
            "adjacent": [
              1816,
              3577,
              3886
            ]
          },
          {
            "id": 3886,
            "name": "Himatangi Beach",
            "adjacent": [
              3886,
              1816
            ]
          },
          {
            "id": 1692,
            "name": "Hiwinui",
            "adjacent": [
              1692
            ]
          },
          {
            "id": 1660,
            "name": "Kelvin Grove",
            "adjacent": [
              1660,
              1661
            ]
          },
          {
            "id": 1694,
            "name": "Kimbolton",
            "adjacent": [
              1694
            ]
          },
          {
            "id": 3289,
            "name": "Mt Biggs",
            "adjacent": [
              3289
            ]
          },
          {
            "id": 1646,
            "name": "Newbury",
            "adjacent": [
              1646
            ]
          },
          {
            "id": 3406,
            "name": "Ohakea",
            "adjacent": [
              3406
            ]
          },
          {
            "id": 3757,
            "name": "Parewanui",
            "adjacent": [
              3757
            ]
          },
          {
            "id": 1695,
            "name": "Pohangina",
            "adjacent": [
              1695
            ]
          },
          {
            "id": 3577,
            "name": "Rangiotu",
            "adjacent": [
              3577,
              1816
            ]
          },
          {
            "id": 3471,
            "name": "Rangiwahia",
            "adjacent": [
              3471
            ]
          },
          {
            "id": 1648,
            "name": "Rongotea",
            "adjacent": [
              1648,
              3833
            ]
          },
          {
            "id": 1408,
            "name": "Sanson",
            "adjacent": [
              1408
            ]
          },
          {
            "id": 1407,
            "name": "Tangimoana",
            "adjacent": [
              1407
            ]
          },
          {
            "id": 3457,
            "name": "Waituna West",
            "adjacent": [
              3457
            ]
          },
          {
            "id": 3615,
            "name": "Whakarongo",
            "adjacent": [
              3615,
              1661,
              3568
            ]
          }
        ]
      },
      {
        "id": 40,
        "name": "Palmerston North",
        "suburbs": [
          {
            "id": 1617,
            "name": "Aokautere",
            "adjacent": [
              1517,
              1617,
              3174
            ]
          },
          {
            "id": 1684,
            "name": "Ashhurst",
            "adjacent": [
              1684
            ]
          },
          {
            "id": 1516,
            "name": "Awapuni",
            "adjacent": [
              1756,
              1189,
              1516,
              1608
            ]
          },
          {
            "id": 1410,
            "name": "Bunnythorpe",
            "adjacent": [
              1410
            ]
          },
          {
            "id": 1468,
            "name": "City Centre",
            "adjacent": [
              1605,
              1606,
              1607,
              1608,
              1637,
              1910,
              1468
            ]
          },
          {
            "id": 1518,
            "name": "Cloverlea",
            "adjacent": [
              1756,
              1518,
              1637
            ]
          },
          {
            "id": 1517,
            "name": "Fitzherbert",
            "adjacent": [
              1517,
              1617,
              3174
            ]
          },
          {
            "id": 1756,
            "name": "Highbury",
            "adjacent": [
              1756,
              1189,
              1516,
              1518,
              1608,
              1637
            ]
          },
          {
            "id": 1607,
            "name": "Hokowhitu",
            "adjacent": [
              1605,
              1606,
              1607,
              1910,
              1468
            ]
          },
          {
            "id": 3456,
            "name": "Kairanga",
            "adjacent": [
              3456
            ]
          },
          {
            "id": 1661,
            "name": "Kelvin Grove",
            "adjacent": [
              1660,
              1661,
              3568,
              3615
            ]
          },
          {
            "id": 1612,
            "name": "Linton",
            "adjacent": [
              1612
            ]
          },
          {
            "id": 1644,
            "name": "Longburn",
            "adjacent": [
              1644,
              1691
            ]
          },
          {
            "id": 1467,
            "name": "Milson",
            "adjacent": [
              1605,
              1606,
              1910,
              1467
            ]
          },
          {
            "id": 1910,
            "name": "Papaioea",
            "adjacent": [
              1605,
              1606,
              1607,
              1910,
              1467,
              1468
            ]
          },
          {
            "id": 1605,
            "name": "Roslyn",
            "adjacent": [
              1605,
              1606,
              1607,
              1910,
              1467,
              1468
            ]
          },
          {
            "id": 1637,
            "name": "Takaro",
            "adjacent": [
              1756,
              1518,
              1608,
              1637,
              1468
            ]
          },
          {
            "id": 1606,
            "name": "Terrace End",
            "adjacent": [
              1605,
              1606,
              1607,
              1910,
              1467,
              1468
            ]
          },
          {
            "id": 3813,
            "name": "Tiakitahuna",
            "adjacent": [
              3813
            ]
          },
          {
            "id": 1691,
            "name": "Turitea",
            "adjacent": [
              1644,
              1691
            ]
          },
          {
            "id": 3044,
            "name": "Westbrook",
            "adjacent": [
              3044
            ]
          },
          {
            "id": 1608,
            "name": "West End",
            "adjacent": [
              1756,
              1189,
              1516,
              1608,
              1637,
              1468
            ]
          },
          {
            "id": 3568,
            "name": "Whakarongo",
            "adjacent": [
              3568,
              1661,
              3615
            ]
          }
        ]
      },
      {
        "id": 38,
        "name": "Rangitikei",
        "suburbs": [
          {
            "id": 1857,
            "name": "Bulls",
            "adjacent": [
              1857
            ]
          },
          {
            "id": 1928,
            "name": "Hunterville",
            "adjacent": [
              1928
            ]
          },
          {
            "id": 1925,
            "name": "Mangaweka",
            "adjacent": [
              1925
            ]
          },
          {
            "id": 2153,
            "name": "Marton",
            "adjacent": [
              2153
            ]
          },
          {
            "id": 3558,
            "name": "Ohingaiti",
            "adjacent": [
              3558
            ]
          },
          {
            "id": 3868,
            "name": "Papanui Junction",
            "adjacent": [
              3868
            ]
          },
          {
            "id": 3764,
            "name": "Parewanui",
            "adjacent": [
              3764
            ]
          },
          {
            "id": 1702,
            "name": "Taihape",
            "adjacent": [
              1702
            ]
          },
          {
            "id": 1047,
            "name": "Turakina",
            "adjacent": [
              1047
            ]
          },
          {
            "id": 3810,
            "name": "Utiku",
            "adjacent": [
              3810
            ]
          }
        ]
      },
      {
        "id": 36,
        "name": "Ruapehu",
        "suburbs": [
          {
            "id": 3844,
            "name": "Aukopae",
            "adjacent": [
              3844
            ]
          },
          {
            "id": 3831,
            "name": "Erua",
            "adjacent": [
              3831
            ]
          },
          {
            "id": 3845,
            "name": "Hikumutu",
            "adjacent": [
              3845
            ]
          },
          {
            "id": 3846,
            "name": "Horopito",
            "adjacent": [
              3846
            ]
          },
          {
            "id": 3816,
            "name": "Kaitieke",
            "adjacent": [
              3816
            ]
          },
          {
            "id": 3847,
            "name": "Kakahi",
            "adjacent": [
              3847
            ]
          },
          {
            "id": 3733,
            "name": "Kirikau",
            "adjacent": [
              3733
            ]
          },
          {
            "id": 3848,
            "name": "Makakahi",
            "adjacent": [
              3848
            ]
          },
          {
            "id": 3849,
            "name": "Manunui",
            "adjacent": [
              3849
            ]
          },
          {
            "id": 3850,
            "name": "Matiere",
            "adjacent": [
              3850
            ]
          },
          {
            "id": 1403,
            "name": "National Park",
            "adjacent": [
              1403
            ]
          },
          {
            "id": 3851,
            "name": "Ngapuke",
            "adjacent": [
              3851
            ]
          },
          {
            "id": 1430,
            "name": "Ohakune",
            "adjacent": [
              1430
            ]
          },
          {
            "id": 1346,
            "name": "Ohura",
            "adjacent": [
              1346
            ]
          },
          {
            "id": 3852,
            "name": "Ongarue",
            "adjacent": [
              3852
            ]
          },
          {
            "id": 3853,
            "name": "Orautoha",
            "adjacent": [
              3853
            ]
          },
          {
            "id": 3854,
            "name": "Otangiwai",
            "adjacent": [
              3854
            ]
          },
          {
            "id": 1402,
            "name": "Owhango",
            "adjacent": [
              1402
            ]
          },
          {
            "id": 3855,
            "name": "Parinui",
            "adjacent": [
              3855
            ]
          },
          {
            "id": 3856,
            "name": "Pipiriki",
            "adjacent": [
              3856
            ]
          },
          {
            "id": 1512,
            "name": "Raetihi",
            "adjacent": [
              1512
            ]
          },
          {
            "id": 3857,
            "name": "Rangataua",
            "adjacent": [
              3857
            ]
          },
          {
            "id": 3370,
            "name": "Raurimu",
            "adjacent": [
              3370
            ]
          },
          {
            "id": 3858,
            "name": "Retaruke",
            "adjacent": [
              3858
            ]
          },
          {
            "id": 3839,
            "name": "Ruatiti",
            "adjacent": [
              3839
            ]
          },
          {
            "id": 3859,
            "name": "Tangiwai",
            "adjacent": [
              3859
            ]
          },
          {
            "id": 3860,
            "name": "Taringamotu",
            "adjacent": [
              3860
            ]
          },
          {
            "id": 1385,
            "name": "Taumarunui",
            "adjacent": [
              1385
            ]
          },
          {
            "id": 3861,
            "name": "Tohunga Junction",
            "adjacent": [
              3861
            ]
          },
          {
            "id": 3862,
            "name": "Tokirima",
            "adjacent": [
              3862
            ]
          },
          {
            "id": 3863,
            "name": "Waimarino",
            "adjacent": [
              3863
            ]
          },
          {
            "id": 3864,
            "name": "Waimiha",
            "adjacent": [
              3864
            ]
          },
          {
            "id": 1431,
            "name": "Waiouru",
            "adjacent": [
              1431
            ]
          },
          {
            "id": 3865,
            "name": "Waiouru Military Area",
            "adjacent": [
              3865
            ]
          },
          {
            "id": 3866,
            "name": "Waitaanga",
            "adjacent": [
              3866
            ]
          }
        ]
      },
      {
        "id": 41,
        "name": "Tararua",
        "suburbs": [
          {
            "id": 3389,
            "name": "Akitio",
            "adjacent": [
              3389
            ]
          },
          {
            "id": 3770,
            "name": "Alfredton",
            "adjacent": [
              3770
            ]
          },
          {
            "id": 1824,
            "name": "Dannevirke",
            "adjacent": [
              3251,
              1824
            ]
          },
          {
            "id": 1322,
            "name": "Eketahuna",
            "adjacent": [
              1322
            ]
          },
          {
            "id": 3621,
            "name": "Herbertville",
            "adjacent": [
              3621
            ]
          },
          {
            "id": 3771,
            "name": "Ihuraua",
            "adjacent": [
              3771
            ]
          },
          {
            "id": 3670,
            "name": "Makotuku",
            "adjacent": [
              3670
            ]
          },
          {
            "id": 3606,
            "name": "Norsewood",
            "adjacent": [
              3606
            ]
          },
          {
            "id": 3671,
            "name": "Ormondville",
            "adjacent": [
              3671
            ]
          },
          {
            "id": 1823,
            "name": "Pahiatua",
            "adjacent": [
              1823
            ]
          },
          {
            "id": 1794,
            "name": "Pongaroa",
            "adjacent": [
              1794
            ]
          },
          {
            "id": 1822,
            "name": "Woodville",
            "adjacent": [
              1822
            ]
          }
        ]
      },
      {
        "id": 37,
        "name": "Whanganui",
        "suburbs": [
          {
            "id": 3705,
            "name": "Aberfeldy",
            "adjacent": [
              3705
            ]
          },
          {
            "id": 1613,
            "name": "Aramoho",
            "adjacent": [
              1613
            ]
          },
          {
            "id": 1665,
            "name": "Bastia Hill",
            "adjacent": [
              1664,
              1665,
              1666,
              1667,
              1672
            ]
          },
          {
            "id": 1396,
            "name": "Brunswick",
            "adjacent": [
              1396
            ]
          },
          {
            "id": 1671,
            "name": "Castlecliff",
            "adjacent": [
              1670,
              1671
            ]
          },
          {
            "id": 1672,
            "name": "City Centre",
            "adjacent": [
              1741,
              1665,
              1666,
              1667,
              1672,
              3177,
              2077,
              3707
            ]
          },
          {
            "id": 3177,
            "name": "College Estate",
            "adjacent": [
              1741,
              1669,
              1672,
              3177,
              2077,
              3707
            ]
          },
          {
            "id": 1666,
            "name": "Durie Hill",
            "adjacent": [
              1665,
              1666,
              1667,
              1672
            ]
          },
          {
            "id": 3250,
            "name": "Fordell",
            "adjacent": [
              3250
            ]
          },
          {
            "id": 1669,
            "name": "Gonville",
            "adjacent": [
              1669,
              1670,
              3177,
              2077,
              3707
            ]
          },
          {
            "id": 3085,
            "name": "Kai Iwi",
            "adjacent": [
              3085
            ]
          },
          {
            "id": 964,
            "name": "Kaitoke",
            "adjacent": [
              964
            ]
          },
          {
            "id": 3762,
            "name": "Kaiwhaiki",
            "adjacent": [
              3762
            ]
          },
          {
            "id": 3870,
            "name": "Kakatahi",
            "adjacent": [
              3870
            ]
          },
          {
            "id": 3805,
            "name": "Koitiata",
            "adjacent": [
              3805
            ]
          },
          {
            "id": 3251,
            "name": "Makirikiri ",
            "adjacent": [
              3251,
              1824
            ]
          },
          {
            "id": 3269,
            "name": "Mangamahu ",
            "adjacent": [
              3269
            ]
          },
          {
            "id": 1668,
            "name": "Marybank",
            "adjacent": [
              1667,
              1668
            ]
          },
          {
            "id": 3871,
            "name": "Matahiwi",
            "adjacent": [
              3871
            ]
          },
          {
            "id": 1777,
            "name": "Maxwell",
            "adjacent": [
              1777
            ]
          },
          {
            "id": 3214,
            "name": "Mosston",
            "adjacent": [
              1670,
              3214,
              2077,
              3707
            ]
          },
          {
            "id": 1778,
            "name": "Okoia",
            "adjacent": [
              1778
            ]
          },
          {
            "id": 1742,
            "name": "Otamatea",
            "adjacent": [
              1741,
              1742
            ]
          },
          {
            "id": 3732,
            "name": "Papaiti",
            "adjacent": [
              3732,
              1673
            ]
          },
          {
            "id": 3697,
            "name": "Paparangi",
            "adjacent": [
              3697
            ]
          },
          {
            "id": 1699,
            "name": "Parikino",
            "adjacent": [
              1699
            ]
          },
          {
            "id": 1667,
            "name": "Putiki",
            "adjacent": [
              1665,
              1666,
              1667,
              1668,
              1672
            ]
          },
          {
            "id": 3869,
            "name": "Ranana",
            "adjacent": [
              3869
            ]
          },
          {
            "id": 1398,
            "name": "Rapanui",
            "adjacent": [
              1398
            ]
          },
          {
            "id": 1741,
            "name": "Saint Johns Hill",
            "adjacent": [
              1741,
              1742,
              1672,
              3177,
              2077,
              3707
            ]
          },
          {
            "id": 2077,
            "name": "Springvale",
            "adjacent": [
              1741,
              1669,
              1670,
              1672,
              3177,
              3214,
              2077,
              3707
            ]
          },
          {
            "id": 1670,
            "name": "Tawhero",
            "adjacent": [
              1669,
              1670,
              1671,
              3214,
              2077,
              3707
            ]
          },
          {
            "id": 1673,
            "name": "Upokongaro",
            "adjacent": [
              1673,
              3732
            ]
          },
          {
            "id": 1743,
            "name": "Westmere",
            "adjacent": [
              1743
            ]
          },
          {
            "id": 3408,
            "name": "Whangaehu",
            "adjacent": [
              3408
            ]
          },
          {
            "id": 3707,
            "name": "Whanganui Central",
            "adjacent": [
              3707,
              1672,
              3177,
              1669,
              3214,
              1741,
              2077,
              1670
            ]
          },
          {
            "id": 1664,
            "name": "Whanganui East",
            "adjacent": [
              1664,
              1665
            ]
          }
        ]
      }
    ]
  },
  {
    "id": 15,
    "name": "Wellington",
    "districts": [
      {
        "id": 49,
        "name": "Carterton",
        "suburbs": [
          {
            "id": 1656,
            "name": "Carterton",
            "adjacent": [
              1656
            ]
          }
        ]
      },
      {
        "id": 43,
        "name": "Kapiti Coast",
        "suburbs": [
          {
            "id": 999,
            "name": "Otaihanga",
            "adjacent": [
              1446,
              1762,
              999
            ]
          },
          {
            "id": 2640,
            "name": "Otaki",
            "adjacent": [
              2640
            ]
          },
          {
            "id": 1211,
            "name": "Otaki Beach",
            "adjacent": [
              1211
            ]
          },
          {
            "id": 1650,
            "name": "Paekakariki",
            "adjacent": [
              1650
            ]
          },
          {
            "id": 1762,
            "name": "Paraparaumu",
            "adjacent": [
              1446,
              1762,
              999
            ]
          },
          {
            "id": 1446,
            "name": "Paraparaumu Beach",
            "adjacent": [
              1446,
              1762,
              999
            ]
          },
          {
            "id": 3099,
            "name": "Peka Peka",
            "adjacent": [
              3099
            ]
          },
          {
            "id": 1652,
            "name": "Raumati Beach",
            "adjacent": [
              1651,
              1652
            ]
          },
          {
            "id": 1651,
            "name": "Raumati South",
            "adjacent": [
              1651,
              1652
            ]
          },
          {
            "id": 3834,
            "name": "Reikorangi",
            "adjacent": [
              3834
            ]
          },
          {
            "id": 1802,
            "name": "Te Horo",
            "adjacent": [
              1802
            ]
          },
          {
            "id": 1445,
            "name": "Waikanae",
            "adjacent": [
              1445,
              998
            ]
          },
          {
            "id": 998,
            "name": "Waikanae Beach",
            "adjacent": [
              1445,
              998
            ]
          }
        ]
      },
      {
        "id": 46,
        "name": "Lower Hutt",
        "suburbs": [
          {
            "id": 2124,
            "name": "Alicetown",
            "adjacent": [
              239,
              1435,
              1448,
              1449,
              1460,
              1654,
              1766,
              1871,
              2119,
              2120,
              2121,
              2124,
              3350,
              1765
            ]
          },
          {
            "id": 1618,
            "name": "Avalon",
            "adjacent": [
              1618,
              1619,
              1620,
              1767,
              2118,
              2122,
              2123,
              3351,
              3364,
              1415,
              1765
            ]
          },
          {
            "id": 2122,
            "name": "Belmont",
            "adjacent": [
              239,
              1618,
              1620,
              2118,
              2120,
              2121,
              2122,
              2123,
              3350,
              3351,
              3364,
              1765
            ]
          },
          {
            "id": 2123,
            "name": "Boulcott",
            "adjacent": [
              239,
              924,
              1449,
              1618,
              1654,
              1767,
              2118,
              2120,
              2121,
              2122,
              2123,
              3350,
              3351,
              3364,
              1765
            ]
          },
          {
            "id": 1428,
            "name": "Days Bay",
            "adjacent": [
              1745,
              1428,
              1763,
              1847,
              2116,
              2117,
              1765
            ]
          },
          {
            "id": 2116,
            "name": "Eastbourne",
            "adjacent": [
              1428,
              1847,
              2116,
              2117,
              2079,
              3364,
              1448,
              1765
            ]
          },
          {
            "id": 2118,
            "name": "Epuni",
            "adjacent": [
              924,
              1618,
              1619,
              1654,
              1767,
              2118,
              2122,
              2123,
              3350,
              3351,
              3364,
              1765
            ]
          },
          {
            "id": 1767,
            "name": "Fairfield",
            "adjacent": [
              924,
              1618,
              1619,
              1654,
              1767,
              2118,
              2123,
              3351,
              3364,
              1765
            ]
          },
          {
            "id": 1872,
            "name": "Gracefield",
            "adjacent": [
              1449,
              1766,
              1871,
              1872,
              1873,
              3657,
              1765
            ]
          },
          {
            "id": 2120,
            "name": "Harbour View",
            "adjacent": [
              239,
              1449,
              1460,
              1654,
              2119,
              2120,
              2121,
              2122,
              2123,
              2124,
              3350,
              1765
            ]
          },
          {
            "id": 1389,
            "name": "Haywards",
            "adjacent": [
              1388,
              1389,
              1765
            ]
          },
          {
            "id": 1416,
            "name": "Holborn",
            "adjacent": [
              1841,
              1388,
              1415,
              1416,
              1765
            ]
          },
          {
            "id": 1620,
            "name": "Kelson",
            "adjacent": [
              1618,
              1620,
              2122,
              3351,
              3364,
              1415,
              1765
            ]
          },
          {
            "id": 1435,
            "name": "Korokoro",
            "adjacent": [
              1435,
              1448,
              1460,
              2124,
              877,
              1765
            ]
          },
          {
            "id": 1654,
            "name": "Lower Hutt",
            "adjacent": [
              239,
              924,
              1449,
              1654,
              1766,
              1767,
              1871,
              2118,
              2119,
              2120,
              2121,
              2123,
              2124,
              3350,
              1765
            ]
          },
          {
            "id": 3331,
            "name": "Lowry Bay",
            "adjacent": [
              1745,
              1763,
              1847,
              1873,
              3331,
              3657,
              1765
            ]
          },
          {
            "id": 1745,
            "name": "Mahina Bay",
            "adjacent": [
              1745,
              1428,
              1763,
              1847,
              3331,
              3657,
              1765
            ]
          },
          {
            "id": 1388,
            "name": "Manor Park",
            "adjacent": [
              1841,
              1388,
              1389,
              1416,
              1765
            ]
          },
          {
            "id": 1460,
            "name": "Maungaraki",
            "adjacent": [
              239,
              1435,
              1448,
              1460,
              2119,
              2120,
              2121,
              2124,
              3350,
              1765
            ]
          },
          {
            "id": 3350,
            "name": "Melling",
            "adjacent": [
              239,
              924,
              1449,
              1460,
              1654,
              2118,
              2119,
              2120,
              2121,
              2122,
              2123,
              2124,
              3350,
              1765
            ]
          },
          {
            "id": 1871,
            "name": "Moera",
            "adjacent": [
              924,
              1448,
              1449,
              1654,
              1766,
              1871,
              1872,
              1873,
              2124,
              1765
            ]
          },
          {
            "id": 2079,
            "name": "Muritai",
            "adjacent": [
              2116,
              2117,
              2079,
              1765
            ]
          },
          {
            "id": 1619,
            "name": "Naenae",
            "adjacent": [
              1618,
              1619,
              1767,
              2118,
              3351,
              3364,
              1765
            ]
          },
          {
            "id": 2119,
            "name": "Normandale",
            "adjacent": [
              239,
              1460,
              1654,
              2119,
              2120,
              2121,
              2124,
              3350,
              1765
            ]
          },
          {
            "id": 3351,
            "name": "Park Avenue",
            "adjacent": [
              924,
              1618,
              1619,
              1620,
              1767,
              2118,
              2122,
              2123,
              3351,
              3364,
              1765
            ]
          },
          {
            "id": 1448,
            "name": "Petone",
            "adjacent": [
              1435,
              1448,
              1449,
              1460,
              1871,
              2124,
              2116,
              1765
            ]
          },
          {
            "id": 3657,
            "name": "Point Howard",
            "adjacent": [
              3657,
              1872,
              3331,
              1745,
              1873,
              1763,
              1765
            ]
          },
          {
            "id": 2117,
            "name": "Rona Bay",
            "adjacent": [
              1428,
              1847,
              2116,
              2117,
              2079,
              1765
            ]
          },
          {
            "id": 1873,
            "name": "Seaview",
            "adjacent": [
              1871,
              1872,
              1873,
              3331,
              3657,
              1765
            ]
          },
          {
            "id": 1841,
            "name": "Stokes Valley",
            "adjacent": [
              1841,
              1388,
              1415,
              1416,
              1765
            ]
          },
          {
            "id": 3364,
            "name": "Sunshine Bay",
            "adjacent": [
              924,
              1618,
              1619,
              1620,
              1767,
              2118,
              2122,
              2123,
              3351,
              3364,
              2116,
              1765
            ]
          },
          {
            "id": 1415,
            "name": "Taita",
            "adjacent": [
              1618,
              1620,
              1841,
              1415,
              1416,
              1765
            ]
          },
          {
            "id": 2121,
            "name": "Tirohanga",
            "adjacent": [
              239,
              1449,
              1460,
              1654,
              2119,
              2120,
              2121,
              2122,
              2123,
              2124,
              3350,
              1765
            ]
          },
          {
            "id": 1765,
            "name": "Wainuiomata",
            "adjacent": [
              1765,
              1654,
              2124,
              1618,
              2122,
              2123,
              1428,
              2116,
              2118,
              1767,
              1872,
              2120,
              1389,
              1416,
              1620
            ]
          },
          {
            "id": 1766,
            "name": "Waiwhetu",
            "adjacent": [
              924,
              1449,
              1654,
              1766,
              1871,
              1872,
              2124,
              1765
            ]
          },
          {
            "id": 924,
            "name": "Waterloo",
            "adjacent": [
              924,
              1449,
              1654,
              1766,
              1767,
              1871,
              2118,
              2123,
              3350,
              3351,
              3364,
              1765
            ]
          },
          {
            "id": 1449,
            "name": "Woburn",
            "adjacent": [
              239,
              924,
              1448,
              1449,
              1654,
              1766,
              1871,
              1872,
              2120,
              2121,
              2123,
              2124,
              3350,
              1765
            ]
          },
          {
            "id": 1763,
            "name": "York Bay",
            "adjacent": [
              1745,
              1428,
              1763,
              1847,
              3331,
              3657,
              1765
            ]
          }
        ]
      },
      {
        "id": 48,
        "name": "Masterton",
        "suburbs": [
          {
            "id": 3835,
            "name": "Bideford",
            "adjacent": [
              3835
            ]
          },
          {
            "id": 3349,
            "name": "Castlepoint",
            "adjacent": [
              3349,
              3576
            ]
          },
          {
            "id": 3434,
            "name": "Flat Point",
            "adjacent": [
              3434
            ]
          },
          {
            "id": 2579,
            "name": "Masterton",
            "adjacent": [
              2579
            ]
          },
          {
            "id": 3576,
            "name": "Mataikona",
            "adjacent": [
              3576,
              3349
            ]
          },
          {
            "id": 3560,
            "name": "Mauriceville",
            "adjacent": [
              3560
            ]
          },
          {
            "id": 3880,
            "name": "Opaki",
            "adjacent": [
              3880
            ]
          },
          {
            "id": 3106,
            "name": "Riversdale Beach",
            "adjacent": [
              3106
            ]
          },
          {
            "id": 3759,
            "name": "Tauweru",
            "adjacent": [
              3759
            ]
          },
          {
            "id": 3788,
            "name": "Whareama",
            "adjacent": [
              3788,
              3787
            ]
          }
        ]
      },
      {
        "id": 44,
        "name": "Porirua",
        "suburbs": [
          {
            "id": 3198,
            "name": "Aotea",
            "adjacent": [
              1520,
              3198,
              2172
            ]
          },
          {
            "id": 1520,
            "name": "Ascot Park",
            "adjacent": [
              1520,
              3198,
              1132
            ]
          },
          {
            "id": 985,
            "name": "Camborne",
            "adjacent": [
              1573,
              1110,
              1433,
              1434,
              1447,
              1842,
              1929,
              1948,
              2783,
              2785,
              973,
              985,
              1334,
              3610
            ]
          },
          {
            "id": 2172,
            "name": "Cannons Creek",
            "adjacent": [
              1447,
              3198,
              2172
            ]
          },
          {
            "id": 1929,
            "name": "Elsdon",
            "adjacent": [
              1573,
              1110,
              1433,
              1434,
              1447,
              1842,
              1929,
              1948,
              2783,
              2785,
              973,
              985,
              1334,
              3610
            ]
          },
          {
            "id": 3613,
            "name": "Judgeford",
            "adjacent": [
              3613
            ]
          },
          {
            "id": 1491,
            "name": "Karehana Bay",
            "adjacent": [
              1491
            ]
          },
          {
            "id": 3610,
            "name": "Kenepuru",
            "adjacent": [
              3610,
              985,
              1929,
              973,
              2783,
              1948,
              2785,
              1110,
              1573,
              1433,
              1842,
              1334,
              1434,
              1930
            ]
          },
          {
            "id": 973,
            "name": "Linden",
            "adjacent": [
              1573,
              1110,
              1433,
              1434,
              1447,
              1842,
              1929,
              1948,
              2783,
              2785,
              973,
              985,
              1334,
              3610
            ]
          },
          {
            "id": 2783,
            "name": "Mana",
            "adjacent": [
              1573,
              1110,
              1433,
              1434,
              1447,
              1842,
              1929,
              1948,
              2783,
              2785,
              973,
              985,
              1334,
              3610
            ]
          },
          {
            "id": 1948,
            "name": "Papakowhai",
            "adjacent": [
              1573,
              1110,
              1433,
              1434,
              1447,
              1842,
              1929,
              1948,
              2783,
              2785,
              973,
              985,
              1334,
              3610
            ]
          },
          {
            "id": 2785,
            "name": "Paremata",
            "adjacent": [
              1573,
              1110,
              1433,
              1434,
              1447,
              1842,
              1929,
              1948,
              2783,
              2785,
              973,
              985,
              1334,
              3610
            ]
          },
          {
            "id": 1110,
            "name": "Pauatahanui",
            "adjacent": [
              1573,
              1110,
              1433,
              1434,
              1447,
              1842,
              1929,
              1948,
              2783,
              2785,
              973,
              985,
              1334,
              3610
            ]
          },
          {
            "id": 1573,
            "name": "Plimmerton",
            "adjacent": [
              1573,
              1110,
              1433,
              1434,
              1447,
              1842,
              1929,
              1948,
              2783,
              2785,
              973,
              985,
              1334,
              3610
            ]
          },
          {
            "id": 1433,
            "name": "Porirua",
            "adjacent": [
              1573,
              1110,
              1433,
              1434,
              1447,
              1842,
              1929,
              1930,
              1948,
              2783,
              2785,
              973,
              985,
              1334,
              3610
            ]
          },
          {
            "id": 1842,
            "name": "Porirua East",
            "adjacent": [
              1573,
              1110,
              1433,
              1434,
              1447,
              1842,
              1929,
              1948,
              2783,
              2785,
              973,
              985,
              1334,
              3610
            ]
          },
          {
            "id": 1853,
            "name": "Pukerua Bay",
            "adjacent": [
              1853
            ]
          },
          {
            "id": 1447,
            "name": "Ranui Heights",
            "adjacent": [
              1573,
              1110,
              1433,
              1434,
              1447,
              1842,
              1929,
              1930,
              1948,
              2783,
              2785,
              2172,
              973,
              985,
              1334
            ]
          },
          {
            "id": 1755,
            "name": "Takapu Valley",
            "adjacent": [
              1755,
              2175
            ]
          },
          {
            "id": 1334,
            "name": "Takapuwahia",
            "adjacent": [
              1573,
              1110,
              1433,
              1434,
              1447,
              1842,
              1929,
              1948,
              2783,
              2785,
              973,
              985,
              1334,
              3610
            ]
          },
          {
            "id": 1515,
            "name": "Titahi Bay",
            "adjacent": [
              1515
            ]
          },
          {
            "id": 1434,
            "name": "Waitangirua",
            "adjacent": [
              1573,
              1110,
              1433,
              1434,
              1447,
              1842,
              1929,
              1948,
              2783,
              2785,
              973,
              985,
              1334,
              3610
            ]
          },
          {
            "id": 1132,
            "name": "Whitby",
            "adjacent": [
              1520,
              1132
            ]
          }
        ]
      },
      {
        "id": 50,
        "name": "South Wairarapa",
        "suburbs": [
          {
            "id": 3347,
            "name": "Cape Palliser",
            "adjacent": [
              3347
            ]
          },
          {
            "id": 1803,
            "name": "Featherston",
            "adjacent": [
              1803,
              1655
            ]
          },
          {
            "id": 3375,
            "name": "Gladstone",
            "adjacent": [
              3375
            ]
          },
          {
            "id": 1655,
            "name": "Greytown",
            "adjacent": [
              1655,
              1803,
              875
            ]
          },
          {
            "id": 3832,
            "name": "Kahutara",
            "adjacent": [
              3832
            ]
          },
          {
            "id": 3534,
            "name": "Lake Ferry",
            "adjacent": [
              3534
            ]
          },
          {
            "id": 875,
            "name": "Martinborough",
            "adjacent": [
              875,
              1655
            ]
          },
          {
            "id": 3348,
            "name": "Ngawi",
            "adjacent": [
              3348
            ]
          },
          {
            "id": 3626,
            "name": "Ocean Beach",
            "adjacent": [
              3626
            ]
          },
          {
            "id": 3551,
            "name": "Tora",
            "adjacent": [
              3551
            ]
          }
        ]
      },
      {
        "id": 45,
        "name": "Upper Hutt",
        "suburbs": [
          {
            "id": 1758,
            "name": "Akatarawa",
            "adjacent": [
              1565,
              1758,
              923,
              3067,
              3071,
              3352,
              2078
            ]
          },
          {
            "id": 1212,
            "name": "Birchville",
            "adjacent": [
              1703,
              1768,
              3411,
              2078,
              1212,
              1400
            ]
          },
          {
            "id": 1799,
            "name": "Blue Mountains",
            "adjacent": [
              920,
              1799
            ]
          },
          {
            "id": 1400,
            "name": "Brown Owl",
            "adjacent": [
              1768,
              3067,
              3094,
              3411,
              2078,
              1212,
              1400
            ]
          },
          {
            "id": 3067,
            "name": "Clouston Park",
            "adjacent": [
              1565,
              1758,
              1768,
              3067,
              3094,
              3352,
              2078,
              1400
            ]
          },
          {
            "id": 3352,
            "name": "Ebdentown",
            "adjacent": [
              1565,
              1758,
              923,
              3067,
              3071,
              3352,
              2078
            ]
          },
          {
            "id": 925,
            "name": "Heretaunga",
            "adjacent": [
              1547,
              920,
              921,
              922,
              925
            ]
          },
          {
            "id": 3166,
            "name": "Kaitoke",
            "adjacent": [
              3166
            ]
          },
          {
            "id": 1565,
            "name": "Kingsley Heights",
            "adjacent": [
              1565,
              1758,
              923,
              3067,
              3094,
              3352,
              2078
            ]
          },
          {
            "id": 1768,
            "name": "Maoribank",
            "adjacent": [
              1768,
              3067,
              3094,
              3411,
              2078,
              1212,
              1399,
              1400
            ]
          },
          {
            "id": 1399,
            "name": "Maymorn",
            "adjacent": [
              1768,
              3094,
              3411,
              1399
            ]
          },
          {
            "id": 3503,
            "name": "Moonshine Valley",
            "adjacent": [
              3503
            ]
          },
          {
            "id": 3411,
            "name": "Mount Marua",
            "adjacent": [
              1703,
              1768,
              1770,
              3094,
              3411,
              1212,
              1399,
              1400
            ]
          },
          {
            "id": 3353,
            "name": "Pakuratahi",
            "adjacent": [
              3353
            ]
          },
          {
            "id": 920,
            "name": "Pinehaven",
            "adjacent": [
              920,
              921,
              925,
              1799
            ]
          },
          {
            "id": 1333,
            "name": "Riverstone Terraces",
            "adjacent": [
              922,
              923,
              3071,
              1333
            ]
          },
          {
            "id": 921,
            "name": "Silverstream",
            "adjacent": [
              1547,
              920,
              921,
              925
            ]
          },
          {
            "id": 1703,
            "name": "Te Marua",
            "adjacent": [
              1703,
              1770,
              3411,
              1212
            ]
          },
          {
            "id": 1770,
            "name": "The Plateau",
            "adjacent": [
              1703,
              1770,
              3411
            ]
          },
          {
            "id": 1769,
            "name": "Timberlea",
            "adjacent": [
              1769
            ]
          },
          {
            "id": 2078,
            "name": "Totara Park",
            "adjacent": [
              1565,
              1758,
              1768,
              3067,
              3094,
              3352,
              2078,
              1212,
              1400
            ]
          },
          {
            "id": 3094,
            "name": "Mangaroa",
            "adjacent": [
              1565,
              1768,
              3067,
              3094,
              3411,
              2078,
              1399,
              1400
            ]
          },
          {
            "id": 922,
            "name": "Trentham",
            "adjacent": [
              1547,
              922,
              923,
              925,
              3071,
              1333
            ]
          },
          {
            "id": 1547,
            "name": "Upper Hutt",
            "adjacent": [
              1547,
              921,
              922,
              925
            ]
          },
          {
            "id": 923,
            "name": "Wallaceville",
            "adjacent": [
              1565,
              1758,
              922,
              923,
              3071,
              3352,
              1333
            ]
          },
          {
            "id": 1840,
            "name": "Whitemans Valley",
            "adjacent": [
              1840
            ]
          },
          {
            "id": 3071,
            "name": "Elderslea",
            "adjacent": [
              1758,
              922,
              923,
              3071,
              3352,
              1333
            ]
          }
        ]
      },
      {
        "id": 47,
        "name": "Wellington",
        "suburbs": [
          {
            "id": 3047,
            "name": "Aro Valley",
            "adjacent": [
              1017,
              1018,
              1094,
              1343,
              1344,
              1345,
              1450,
              1622,
              1783,
              3047,
              3054,
              1486,
              1326
            ]
          },
          {
            "id": 1342,
            "name": "Berhampore",
            "adjacent": [
              1567,
              1568,
              1018,
              1124,
              1342,
              1343,
              1344,
              1450,
              1622,
              1784,
              1785,
              3164,
              1294,
              1226,
              1795
            ]
          },
          {
            "id": 3048,
            "name": "Breaker Bay",
            "adjacent": [
              930,
              1341,
              1621,
              3048,
              1487,
              3226,
              1796
            ]
          },
          {
            "id": 951,
            "name": "Broadmeadows",
            "adjacent": [
              950,
              951,
              1761,
              966,
              967,
              1797
            ]
          },
          {
            "id": 1018,
            "name": "Brooklyn",
            "adjacent": [
              1568,
              1018,
              1124,
              1342,
              1343,
              1344,
              1345,
              1450,
              1622,
              1783,
              3047,
              3054,
              1486,
              1326,
              1759
            ]
          },
          {
            "id": 1798,
            "name": "Chartwell",
            "adjacent": [
              1559,
              1019,
              1115,
              1653,
              1761,
              3053,
              1798
            ]
          },
          {
            "id": 1199,
            "name": "Churton Park",
            "adjacent": [
              1560,
              1199,
              2638,
              3049,
              3330,
              967
            ]
          },
          {
            "id": 1487,
            "name": "Crawford",
            "adjacent": [
              1567,
              930,
              1341,
              1621,
              3042,
              3048,
              3051,
              3164,
              1487,
              3226,
              1294,
              1226,
              1795,
              1796
            ]
          },
          {
            "id": 1653,
            "name": "Crofton Downs",
            "adjacent": [
              1559,
              1019,
              1115,
              1653,
              1761,
              1798
            ]
          },
          {
            "id": 3164,
            "name": "Evans Bay",
            "adjacent": [
              1566,
              1567,
              1124,
              1341,
              1342,
              1450,
              3042,
              3164,
              1487,
              874,
              1294,
              1326,
              1226,
              1795
            ]
          },
          {
            "id": 3049,
            "name": "Glenside",
            "adjacent": [
              1560,
              1199,
              2638,
              3049,
              3330
            ]
          },
          {
            "id": 978,
            "name": "Grenada",
            "adjacent": [
              1852,
              965,
              978,
              980
            ]
          },
          {
            "id": 980,
            "name": "Grenada North",
            "adjacent": [
              1852,
              965,
              978,
              980
            ]
          },
          {
            "id": 3330,
            "name": "Grenada Village",
            "adjacent": [
              1560,
              1199,
              1538,
              2638,
              3049,
              3330,
              967
            ]
          },
          {
            "id": 874,
            "name": "Hataitai",
            "adjacent": [
              1566,
              1124,
              1450,
              3040,
              3042,
              3054,
              3164,
              1486,
              874,
              1294,
              1326
            ]
          },
          {
            "id": 1783,
            "name": "Highbury",
            "adjacent": [
              1017,
              1018,
              1019,
              1094,
              1117,
              1345,
              1450,
              1783,
              3047,
              3054,
              1486
            ]
          },
          {
            "id": 877,
            "name": "Horokiwi",
            "adjacent": [
              1435,
              2638,
              877
            ]
          },
          {
            "id": 1784,
            "name": "Houghton Bay",
            "adjacent": [
              1567,
              1342,
              1784,
              1785,
              3051,
              1226,
              1795,
              979
            ]
          },
          {
            "id": 1785,
            "name": "Island Bay",
            "adjacent": [
              1567,
              1568,
              1342,
              1759,
              1784,
              1785,
              1795,
              979
            ]
          },
          {
            "id": 967,
            "name": "Johnsonville",
            "adjacent": [
              1560,
              950,
              951,
              1199,
              1538,
              3330,
              967
            ]
          },
          {
            "id": 1760,
            "name": "Kaiwharawhara",
            "adjacent": [
              1559,
              1115,
              1760,
              1761,
              3053,
              1797
            ]
          },
          {
            "id": 3050,
            "name": "Karaka Bays",
            "adjacent": [
              1341,
              1621,
              3042,
              3050,
              3226,
              1796
            ]
          },
          {
            "id": 1117,
            "name": "Karori",
            "adjacent": [
              1017,
              1117,
              1345,
              1783
            ]
          },
          {
            "id": 1345,
            "name": "Kelburn",
            "adjacent": [
              1559,
              1017,
              1018,
              1019,
              1094,
              1117,
              1345,
              1450,
              1783,
              3047,
              3053,
              3054,
              1486,
              1326
            ]
          },
          {
            "id": 1797,
            "name": "Khandallah",
            "adjacent": [
              950,
              951,
              1115,
              1760,
              1761,
              966,
              1797
            ]
          },
          {
            "id": 1294,
            "name": "Kilbirnie",
            "adjacent": [
              1567,
              1124,
              1341,
              1342,
              1450,
              3042,
              3164,
              1487,
              874,
              1294,
              1326,
              1226,
              1795
            ]
          },
          {
            "id": 1568,
            "name": "Kingston",
            "adjacent": [
              1567,
              1568,
              1018,
              1124,
              1342,
              1343,
              1344,
              1450,
              1622,
              1785,
              979,
              1759
            ]
          },
          {
            "id": 1622,
            "name": "Kowhai Park",
            "adjacent": [
              1568,
              1018,
              1124,
              1342,
              1343,
              1344,
              1450,
              1622,
              3047,
              1759
            ]
          },
          {
            "id": 1094,
            "name": "Lambton",
            "adjacent": [
              1559,
              1017,
              1019,
              1094,
              1345,
              1450,
              1783,
              3040,
              3047,
              3053,
              3054,
              1486,
              1326
            ]
          },
          {
            "id": 1930,
            "name": "Linden",
            "adjacent": [
              1433,
              1447,
              1930,
              965,
              3610
            ]
          },
          {
            "id": 1795,
            "name": "Lyall Bay",
            "adjacent": [
              1567,
              1124,
              1342,
              1784,
              1785,
              3051,
              3164,
              1487,
              1294,
              1226,
              1795,
              979,
              930
            ]
          },
          {
            "id": 3043,
            "name": "Makara-Ohariu",
            "adjacent": [
              3043
            ]
          },
          {
            "id": 3042,
            "name": "Maupuia",
            "adjacent": [
              1566,
              1341,
              1621,
              3042,
              3050,
              3164,
              1487,
              3226,
              874,
              1294,
              1796
            ]
          },
          {
            "id": 1567,
            "name": "Melrose",
            "adjacent": [
              1567,
              1568,
              1124,
              1342,
              1784,
              1785,
              3051,
              3164,
              1487,
              1294,
              1226,
              1795,
              979
            ]
          },
          {
            "id": 1341,
            "name": "Miramar",
            "adjacent": [
              930,
              1341,
              1621,
              3042,
              3048,
              3050,
              3164,
              1487,
              3226,
              1294,
              1226,
              1796
            ]
          },
          {
            "id": 3051,
            "name": "Moa Point",
            "adjacent": [
              1567,
              930,
              1784,
              3051,
              1487,
              1226,
              1795,
              979
            ]
          },
          {
            "id": 1343,
            "name": "Mornington",
            "adjacent": [
              1568,
              1018,
              1124,
              1342,
              1343,
              1344,
              1450,
              1622,
              3047,
              1759
            ]
          },
          {
            "id": 1450,
            "name": "Mount Cook",
            "adjacent": [
              1018,
              1124,
              1342,
              1343,
              1344,
              1450,
              1622,
              3047,
              3164,
              1486,
              874,
              1326,
              3054
            ]
          },
          {
            "id": 1326,
            "name": "Mount Victoria",
            "adjacent": [
              1566,
              1018,
              1094,
              1124,
              1345,
              1450,
              3040,
              3047,
              3054,
              3164,
              1486,
              874,
              1294,
              1326
            ]
          },
          {
            "id": 1538,
            "name": "Newlands",
            "adjacent": [
              1560,
              950,
              1538,
              2638,
              3330,
              966,
              967
            ]
          },
          {
            "id": 1124,
            "name": "Newtown",
            "adjacent": [
              1567,
              1568,
              1018,
              1124,
              1342,
              1343,
              1344,
              1450,
              1622,
              3164,
              874,
              1294,
              1326,
              1226,
              1795
            ]
          },
          {
            "id": 1761,
            "name": "Ngaio",
            "adjacent": [
              951,
              1115,
              1653,
              1760,
              1761,
              1797,
              1798
            ]
          },
          {
            "id": 966,
            "name": "Ngauranga",
            "adjacent": [
              950,
              951,
              1538,
              966,
              1797
            ]
          },
          {
            "id": 1017,
            "name": "Northland",
            "adjacent": [
              1559,
              1017,
              1019,
              1094,
              1117,
              1345,
              1783,
              3047,
              3053,
              3054,
              1486
            ]
          },
          {
            "id": 993,
            "name": "Ohariu",
            "adjacent": [
              993
            ]
          },
          {
            "id": 3040,
            "name": "Oriental Bay",
            "adjacent": [
              1566,
              1094,
              1450,
              3040,
              3054,
              1486,
              874,
              1326
            ]
          },
          {
            "id": 1759,
            "name": "Owhiro Bay",
            "adjacent": [
              1759,
              1785,
              979,
              1018,
              1568,
              1343,
              1622
            ]
          },
          {
            "id": 1560,
            "name": "Paparangi",
            "adjacent": [
              1560,
              950,
              1199,
              1538,
              2638,
              3049,
              3330,
              967
            ]
          },
          {
            "id": 3053,
            "name": "Pipitea",
            "adjacent": [
              1559,
              1017,
              1019,
              1094,
              1115,
              1345,
              1760,
              3053,
              3054,
              1486,
              1798
            ]
          },
          {
            "id": 950,
            "name": "Raroa",
            "adjacent": [
              1560,
              950,
              951,
              1538,
              966,
              967,
              1797
            ]
          },
          {
            "id": 1852,
            "name": "Redwood",
            "adjacent": [
              1852,
              965,
              978,
              980
            ]
          },
          {
            "id": 1226,
            "name": "Rongotai",
            "adjacent": [
              1567,
              930,
              1124,
              1341,
              1342,
              1784,
              3051,
              3164,
              1487,
              3226,
              1294,
              1226,
              1795,
              979
            ]
          },
          {
            "id": 1566,
            "name": "Roseneath",
            "adjacent": [
              1566,
              3040,
              3042,
              3054,
              3164,
              1486,
              874,
              1326
            ]
          },
          {
            "id": 1796,
            "name": "Seatoun",
            "adjacent": [
              930,
              1341,
              1621,
              3042,
              3048,
              3050,
              1487,
              3226,
              1796
            ]
          },
          {
            "id": 1621,
            "name": "Seatoun Bays",
            "adjacent": [
              930,
              1341,
              1621,
              3042,
              3048,
              3050,
              1487,
              3226,
              1796
            ]
          },
          {
            "id": 3226,
            "name": "Seatoun Heights",
            "adjacent": [
              930,
              1341,
              1621,
              3042,
              3048,
              3050,
              1487,
              3226,
              1226,
              1796
            ]
          },
          {
            "id": 979,
            "name": "Southgate",
            "adjacent": [
              979,
              1226,
              1342,
              1567,
              1568,
              1759,
              1784,
              1785,
              1795,
              3051
            ]
          },
          {
            "id": 930,
            "name": "Strathmore Park",
            "adjacent": [
              930,
              1341,
              1621,
              3048,
              3051,
              1487,
              3226,
              1226,
              1796,
              1795
            ]
          },
          {
            "id": 965,
            "name": "Tawa",
            "adjacent": [
              1852,
              1930,
              965,
              978,
              980
            ]
          },
          {
            "id": 1486,
            "name": "Te Aro",
            "adjacent": [
              1559,
              1566,
              1017,
              1018,
              1094,
              1345,
              1450,
              1783,
              3040,
              3047,
              3053,
              3054,
              1486,
              874,
              1326
            ]
          },
          {
            "id": 1559,
            "name": "Thorndon",
            "adjacent": [
              1559,
              1017,
              1019,
              1094,
              1115,
              1345,
              1653,
              1760,
              3053,
              3054,
              1486,
              1798
            ]
          },
          {
            "id": 1344,
            "name": "Vogeltown",
            "adjacent": [
              1568,
              1018,
              1124,
              1342,
              1343,
              1344,
              1450,
              1622,
              3047
            ]
          },
          {
            "id": 1115,
            "name": "Wadestown",
            "adjacent": [
              1559,
              1019,
              1115,
              1653,
              1760,
              1761,
              3053,
              1797,
              1798
            ]
          },
          {
            "id": 3054,
            "name": "Wellington Central",
            "adjacent": [
              1559,
              1566,
              1017,
              1018,
              1094,
              1345,
              1450,
              1783,
              3040,
              3047,
              3053,
              3054,
              1486,
              874,
              1326
            ]
          },
          {
            "id": 1019,
            "name": "Wilton",
            "adjacent": [
              1559,
              1017,
              1019,
              1094,
              1115,
              1345,
              1653,
              1783,
              3053,
              1798
            ]
          },
          {
            "id": 2638,
            "name": "Woodridge",
            "adjacent": [
              1560,
              1199,
              1538,
              2638,
              3049,
              3330,
              877
            ]
          }
        ]
      }
    ]
  },
  {
    "id": 8,
    "name": "Nelson / Tasman",
    "districts": [
      {
        "id": 52,
        "name": "Nelson",
        "suburbs": [
          {
            "id": 2401,
            "name": "Annesbrook",
            "adjacent": [
              2231,
              2232,
              2316,
              2400,
              2401,
              2402,
              3280,
              3292,
              3532
            ]
          },
          {
            "id": 2318,
            "name": "Atawhai",
            "adjacent": [
              2317,
              2318,
              2319
            ]
          },
          {
            "id": 3601,
            "name": "Beachville",
            "adjacent": [
              3601,
              2269,
              2397,
              2396,
              3532,
              3260,
              2395,
              2398,
              3492,
              2270,
              2375,
              3398,
              3254
            ]
          },
          {
            "id": 2316,
            "name": "Bishopdale",
            "adjacent": [
              2316,
              3280,
              2231,
              2232,
              3292,
              2401,
              2402
            ]
          },
          {
            "id": 2269,
            "name": "Britannia Heights",
            "adjacent": [
              2269,
              2270,
              2375,
              2397,
              2398,
              3254,
              3260,
              3280,
              3398,
              3492,
              3532,
              3601
            ]
          },
          {
            "id": 3308,
            "name": "Cable Bay ",
            "adjacent": [
              1922,
              1923,
              3308
            ]
          },
          {
            "id": 2397,
            "name": "City Centre",
            "adjacent": [
              2269,
              2270,
              2375,
              3254,
              3260,
              3398,
              3492,
              2394,
              2395,
              2396,
              2397,
              2398,
              3601
            ]
          },
          {
            "id": 3292,
            "name": "Enner Glynn",
            "adjacent": [
              2316,
              2231,
              2232,
              3292,
              2401,
              2402
            ]
          },
          {
            "id": 2527,
            "name": "Hira",
            "adjacent": [
              2527
            ]
          },
          {
            "id": 3580,
            "name": "Kikiwa",
            "adjacent": [
              3580
            ]
          },
          {
            "id": 2396,
            "name": "Maitai",
            "adjacent": [
              2317,
              2375,
              3254,
              3260,
              2394,
              2395,
              2396,
              2397,
              2398,
              3601
            ]
          },
          {
            "id": 2231,
            "name": "Maitlands",
            "adjacent": [
              2315,
              2316,
              2231,
              2232,
              3292,
              3299,
              2401,
              2402
            ]
          },
          {
            "id": 2319,
            "name": "Marybank",
            "adjacent": [
              2319,
              3483,
              2318
            ]
          },
          {
            "id": 3532,
            "name": "Moana",
            "adjacent": [
              2269,
              2270,
              2398,
              2400,
              2401,
              3254,
              3280,
              3398,
              3492,
              3532,
              3601
            ]
          },
          {
            "id": 3297,
            "name": "Monaco",
            "adjacent": [
              2315,
              3297,
              2402
            ]
          },
          {
            "id": 2402,
            "name": "Nayland",
            "adjacent": [
              2315,
              2316,
              3280,
              2231,
              2232,
              3292,
              3297,
              2400,
              2401,
              2402
            ]
          },
          {
            "id": 3260,
            "name": "Nelson",
            "adjacent": [
              2317,
              2269,
              2270,
              2375,
              3254,
              3260,
              3398,
              3492,
              2394,
              2395,
              2396,
              2397,
              2398,
              3601
            ]
          },
          {
            "id": 2395,
            "name": "Nelson East",
            "adjacent": [
              2317,
              2375,
              3260,
              2394,
              2395,
              2396,
              2397,
              2398,
              3601
            ]
          },
          {
            "id": 2398,
            "name": "Nelson South",
            "adjacent": [
              2269,
              2270,
              2375,
              2394,
              2395,
              2396,
              2397,
              2398,
              3254,
              3260,
              3280,
              3398,
              3492,
              3532,
              3601
            ]
          },
          {
            "id": 3299,
            "name": "Ngawhatu",
            "adjacent": [
              2315,
              2231,
              3299
            ]
          },
          {
            "id": 3492,
            "name": "Port Hills",
            "adjacent": [
              2269,
              2270,
              2375,
              2397,
              2398,
              3254,
              3260,
              3398,
              3492,
              3532,
              3601
            ]
          },
          {
            "id": 2270,
            "name": "Stepneyville",
            "adjacent": [
              2269,
              2270,
              2375,
              2397,
              2398,
              3254,
              3260,
              3398,
              3492,
              3532,
              3601
            ]
          },
          {
            "id": 2315,
            "name": "Stoke",
            "adjacent": [
              2315,
              2231,
              3297,
              3299,
              2402
            ]
          },
          {
            "id": 2400,
            "name": "Tahunanui",
            "adjacent": [
              2232,
              2400,
              2401,
              2402,
              3280,
              3398,
              3532
            ]
          },
          {
            "id": 3280,
            "name": "Tahunanui Hills",
            "adjacent": [
              2232,
              2269,
              2316,
              2398,
              2400,
              2401,
              2402,
              3280,
              3398,
              3532
            ]
          },
          {
            "id": 2394,
            "name": "The Brook",
            "adjacent": [
              2375,
              3260,
              3398,
              2394,
              2395,
              2396,
              2397,
              2398
            ]
          },
          {
            "id": 3304,
            "name": "The Glen",
            "adjacent": [
              3304
            ]
          },
          {
            "id": 2375,
            "name": "The Wood",
            "adjacent": [
              2317,
              2269,
              2270,
              2375,
              3254,
              3260,
              3492,
              2394,
              2395,
              2396,
              2397,
              2398,
              3601
            ]
          },
          {
            "id": 3483,
            "name": "Todds Valley",
            "adjacent": [
              2319,
              2244,
              3483
            ]
          },
          {
            "id": 3398,
            "name": "Toi Toi",
            "adjacent": [
              2269,
              2270,
              2394,
              2397,
              2398,
              2400,
              3254,
              3260,
              3280,
              3398,
              3492,
              3532,
              3601
            ]
          },
          {
            "id": 2244,
            "name": "Wakapuaka",
            "adjacent": [
              2244,
              3483
            ]
          },
          {
            "id": 2232,
            "name": "Wakatu",
            "adjacent": [
              2316,
              3280,
              2231,
              2232,
              3292,
              2400,
              2401,
              2402
            ]
          },
          {
            "id": 3254,
            "name": "Washington Valley",
            "adjacent": [
              2269,
              2270,
              2375,
              2396,
              2397,
              2398,
              3254,
              3260,
              3398,
              3492,
              3532,
              3601
            ]
          },
          {
            "id": 2601,
            "name": "Whangamoa",
            "adjacent": [
              2601
            ]
          }
        ]
      },
      {
        "id": 51,
        "name": "Tasman",
        "suburbs": [
          {
            "id": 3291,
            "name": "Aniseed Valley",
            "adjacent": [
              3291,
              2562
            ]
          },
          {
            "id": 3407,
            "name": "Appleby",
            "adjacent": [
              2133,
              3407,
              2562
            ]
          },
          {
            "id": 3830,
            "name": "Bainham",
            "adjacent": [
              3830
            ]
          },
          {
            "id": 3460,
            "name": "Best Island",
            "adjacent": [
              2133,
              3460
            ]
          },
          {
            "id": 2612,
            "name": "Brightwater",
            "adjacent": [
              2612,
              2562
            ]
          },
          {
            "id": 3722,
            "name": "Brooklyn",
            "adjacent": [
              3722
            ]
          },
          {
            "id": 3716,
            "name": "Clifton",
            "adjacent": [
              3716,
              2570
            ]
          },
          {
            "id": 3046,
            "name": "Golden Bay",
            "adjacent": [
              2569,
              3046
            ]
          },
          {
            "id": 2085,
            "name": "Collingwood",
            "adjacent": [
              2085
            ]
          },
          {
            "id": 2135,
            "name": "Dovedale",
            "adjacent": [
              2135
            ]
          },
          {
            "id": 2562,
            "name": "Hope",
            "adjacent": [
              2562,
              3407,
              2563,
              3291,
              2612
            ]
          },
          {
            "id": 3876,
            "name": "Howard",
            "adjacent": [
              3876
            ]
          },
          {
            "id": 3439,
            "name": "Kaiteriteri",
            "adjacent": [
              3438,
              3439
            ]
          },
          {
            "id": 3294,
            "name": "Kohatu",
            "adjacent": [
              3294,
              3298
            ]
          },
          {
            "id": 2566,
            "name": "Korere",
            "adjacent": [
              2566
            ]
          },
          {
            "id": 3295,
            "name": "Lower Moutere",
            "adjacent": [
              3295,
              2089
            ]
          },
          {
            "id": 3296,
            "name": "Mahana",
            "adjacent": [
              3296
            ]
          },
          {
            "id": 2133,
            "name": "Mapua",
            "adjacent": [
              2133,
              3407,
              3460,
              3303
            ]
          },
          {
            "id": 3438,
            "name": "Marahau",
            "adjacent": [
              3438,
              3439
            ]
          },
          {
            "id": 2089,
            "name": "Motueka",
            "adjacent": [
              2089,
              2803,
              3295,
              2087
            ]
          },
          {
            "id": 3298,
            "name": "Motupiko",
            "adjacent": [
              3294,
              3298
            ]
          },
          {
            "id": 2565,
            "name": "Murchison",
            "adjacent": [
              2565
            ]
          },
          {
            "id": 2087,
            "name": "Ngatimoti",
            "adjacent": [
              2087,
              2089
            ]
          },
          {
            "id": 3537,
            "name": "Onekaka",
            "adjacent": [
              3537
            ]
          },
          {
            "id": 3300,
            "name": "Owen River",
            "adjacent": [
              3300
            ]
          },
          {
            "id": 3554,
            "name": "Pakawau",
            "adjacent": [
              3554,
              3588
            ]
          },
          {
            "id": 3538,
            "name": "Parapara",
            "adjacent": [
              3538
            ]
          },
          {
            "id": 3301,
            "name": "Patons Rock",
            "adjacent": [
              3301
            ]
          },
          {
            "id": 2570,
            "name": "Pohara",
            "adjacent": [
              2570,
              3716
            ]
          },
          {
            "id": 3588,
            "name": "Puponga",
            "adjacent": [
              3588,
              3554
            ]
          },
          {
            "id": 2578,
            "name": "Rabbit Island",
            "adjacent": [
              2578
            ]
          },
          {
            "id": 3302,
            "name": "Redwood Valley",
            "adjacent": [
              3302
            ]
          },
          {
            "id": 2563,
            "name": "Richmond",
            "adjacent": [
              2563,
              2562
            ]
          },
          {
            "id": 2803,
            "name": "Riwaka",
            "adjacent": [
              2803,
              2089
            ]
          },
          {
            "id": 3303,
            "name": "Ruby Bay",
            "adjacent": [
              3303,
              2133
            ]
          },
          {
            "id": 2157,
            "name": "Saint Arnaud",
            "adjacent": [
              2157
            ]
          },
          {
            "id": 3743,
            "name": "Stanley Brook",
            "adjacent": [
              3743
            ]
          },
          {
            "id": 2569,
            "name": "Takaka",
            "adjacent": [
              2569,
              3046
            ]
          },
          {
            "id": 2564,
            "name": "Tapawera",
            "adjacent": [
              2564
            ]
          },
          {
            "id": 2131,
            "name": "Tasman",
            "adjacent": [
              2131
            ]
          },
          {
            "id": 3536,
            "name": "Tata Beach",
            "adjacent": [
              3536
            ]
          },
          {
            "id": 2132,
            "name": "Upper Moutere",
            "adjacent": [
              2132
            ]
          },
          {
            "id": 2611,
            "name": "Wakefield",
            "adjacent": [
              2611
            ]
          }
        ]
      }
    ]
  },
  {
    "id": 7,
    "name": "Marlborough",
    "districts": [
      {
        "id": 82,
        "name": "Blenheim",
        "suburbs": [
          {
            "id": 3655,
            "name": "Blenheim",
            "adjacent": [
              3655,
              2226,
              3640,
              3469,
              3104,
              2241,
              3119
            ]
          },
          {
            "id": 2226,
            "name": "Blenheim Central",
            "adjacent": [
              3104,
              3111,
              2226,
              3231,
              3469,
              3628,
              3640,
              3655
            ]
          },
          {
            "id": 3571,
            "name": "Burleigh",
            "adjacent": [
              3571,
              3104,
              3119,
              3628
            ]
          },
          {
            "id": 3640,
            "name": "Islington",
            "adjacent": [
              3640,
              2226,
              3469,
              3105,
              3111,
              3655
            ]
          },
          {
            "id": 3469,
            "name": "Mayfield",
            "adjacent": [
              3111,
              2226,
              3469,
              3640,
              3655
            ]
          },
          {
            "id": 3572,
            "name": "Omaka",
            "adjacent": [
              3572
            ]
          },
          {
            "id": 3104,
            "name": "Redwoodtown",
            "adjacent": [
              3104,
              3119,
              2226,
              3231,
              3571,
              3655
            ]
          },
          {
            "id": 2241,
            "name": "Riverlands",
            "adjacent": [
              2241,
              3655
            ]
          },
          {
            "id": 3105,
            "name": "Riversdale",
            "adjacent": [
              3105,
              2242,
              3640
            ]
          },
          {
            "id": 3111,
            "name": "Springlands",
            "adjacent": [
              3111,
              2226,
              3469,
              3628,
              3640
            ]
          },
          {
            "id": 3119,
            "name": "Witherlea",
            "adjacent": [
              3104,
              3119,
              3231,
              3571,
              3655
            ]
          },
          {
            "id": 3628,
            "name": "Yelverton",
            "adjacent": [
              3628,
              2226,
              3571,
              3111
            ]
          }
        ]
      },
      {
        "id": 54,
        "name": "Kaikoura",
        "suburbs": [
          {
            "id": 3753,
            "name": "Goose Bay",
            "adjacent": [
              3753
            ]
          },
          {
            "id": 2111,
            "name": "Kaikoura",
            "adjacent": [
              2111
            ]
          },
          {
            "id": 2204,
            "name": "Kekerengu",
            "adjacent": [
              2204
            ]
          }
        ]
      },
      {
        "id": 53,
        "name": "Marlborough",
        "suburbs": [
          {
            "id": 3319,
            "name": "Anakiwa ",
            "adjacent": [
              3319
            ]
          },
          {
            "id": 3248,
            "name": "Awatere Valley",
            "adjacent": [
              3248
            ]
          },
          {
            "id": 3607,
            "name": "Blind River",
            "adjacent": [
              3607
            ]
          },
          {
            "id": 3124,
            "name": "Dashwood",
            "adjacent": [
              3124
            ]
          },
          {
            "id": 2224,
            "name": "Fairhall",
            "adjacent": [
              2224
            ]
          },
          {
            "id": 2242,
            "name": "Grovetown",
            "adjacent": [
              2200,
              3105,
              2242
            ]
          },
          {
            "id": 2195,
            "name": "Havelock",
            "adjacent": [
              2195
            ]
          },
          {
            "id": 3624,
            "name": "Hawkesbury",
            "adjacent": [
              3624,
              2225,
              2605
            ]
          },
          {
            "id": 3126,
            "name": "Kenepuru Sounds",
            "adjacent": [
              3126
            ]
          },
          {
            "id": 3819,
            "name": "Kaituna",
            "adjacent": [
              3819
            ]
          },
          {
            "id": 3691,
            "name": "Kaiuma Bay",
            "adjacent": [
              3691
            ]
          },
          {
            "id": 3041,
            "name": "Marlborough Sounds",
            "adjacent": [
              3041
            ]
          },
          {
            "id": 3249,
            "name": "Koromiko",
            "adjacent": [
              3249
            ]
          },
          {
            "id": 2346,
            "name": "Linkwater",
            "adjacent": [
              2346
            ]
          },
          {
            "id": 3498,
            "name": "Mahau Sound",
            "adjacent": [
              3498
            ]
          },
          {
            "id": 3561,
            "name": "Ngakuta Bay",
            "adjacent": [
              3561
            ]
          },
          {
            "id": 3128,
            "name": "Pelorus Sounds",
            "adjacent": [
              3128
            ]
          },
          {
            "id": 3459,
            "name": "North Bank",
            "adjacent": [
              3459
            ]
          },
          {
            "id": 3594,
            "name": "North West Bay",
            "adjacent": [
              3594
            ]
          },
          {
            "id": 2193,
            "name": "Okaramio",
            "adjacent": [
              2193
            ]
          },
          {
            "id": 3388,
            "name": "Okiwi Bay",
            "adjacent": [
              3388
            ]
          },
          {
            "id": 3458,
            "name": "Onamalutu Valley",
            "adjacent": [
              3458
            ]
          },
          {
            "id": 3129,
            "name": "Queen Charlotte Sounds",
            "adjacent": [
              3129
            ]
          },
          {
            "id": 2198,
            "name": "Picton",
            "adjacent": [
              2198
            ]
          },
          {
            "id": 3696,
            "name": "Port Underwood",
            "adjacent": [
              3696
            ]
          },
          {
            "id": 2284,
            "name": "Portage",
            "adjacent": [
              2284
            ]
          },
          {
            "id": 3735,
            "name": "Punga Cove",
            "adjacent": [
              3735
            ]
          },
          {
            "id": 2281,
            "name": "Rai Valley",
            "adjacent": [
              2281
            ]
          },
          {
            "id": 2192,
            "name": "Rapaura",
            "adjacent": [
              2192
            ]
          },
          {
            "id": 3268,
            "name": "Rarangi",
            "adjacent": [
              3268
            ]
          },
          {
            "id": 2225,
            "name": "Renwick",
            "adjacent": [
              2605,
              2225,
              3624
            ]
          },
          {
            "id": 2223,
            "name": "Seddon",
            "adjacent": [
              2223
            ]
          },
          {
            "id": 2200,
            "name": "Spring Creek",
            "adjacent": [
              2200,
              2242
            ]
          },
          {
            "id": 2196,
            "name": "Tennyson Inlet",
            "adjacent": [
              2196
            ]
          },
          {
            "id": 3763,
            "name": "Totaranui",
            "adjacent": [
              3763
            ]
          },
          {
            "id": 2191,
            "name": "Tuamarina",
            "adjacent": [
              2191
            ]
          },
          {
            "id": 2199,
            "name": "Waihopai Valley",
            "adjacent": [
              2199
            ]
          },
          {
            "id": 2345,
            "name": "Waikawa",
            "adjacent": [
              2345
            ]
          },
          {
            "id": 2605,
            "name": "Wairau Valley",
            "adjacent": [
              2605,
              2225,
              3624
            ]
          },
          {
            "id": 2222,
            "name": "Ward",
            "adjacent": [
              2222
            ]
          },
          {
            "id": 2518,
            "name": "Woodbourne",
            "adjacent": [
              2518
            ]
          }
        ]
      }
    ]
  },
  {
    "id": 16,
    "name": "West Coast",
    "districts": [
      {
        "id": 55,
        "name": "Buller",
        "suburbs": [
          {
            "id": 3661,
            "name": "Cape Foulwind",
            "adjacent": [
              3661
            ]
          },
          {
            "id": 3120,
            "name": "Carters Beach",
            "adjacent": [
              3120
            ]
          },
          {
            "id": 2412,
            "name": "Charleston",
            "adjacent": [
              2412
            ]
          },
          {
            "id": 3121,
            "name": "Fairdown",
            "adjacent": [
              3121
            ]
          },
          {
            "id": 3122,
            "name": "Granity",
            "adjacent": [
              3122,
              3361
            ]
          },
          {
            "id": 2582,
            "name": "Hector",
            "adjacent": [
              2582,
              3377
            ]
          },
          {
            "id": 2466,
            "name": "Inangahua",
            "adjacent": [
              2466
            ]
          },
          {
            "id": 2384,
            "name": "Karamea",
            "adjacent": [
              2384
            ]
          },
          {
            "id": 3501,
            "name": "Little Wanganui",
            "adjacent": [
              3501
            ]
          },
          {
            "id": 3556,
            "name": "Maruia",
            "adjacent": [
              3556
            ]
          },
          {
            "id": 3361,
            "name": "Millerton",
            "adjacent": [
              3122,
              3361
            ]
          },
          {
            "id": 2385,
            "name": "Mokihinui",
            "adjacent": [
              2385
            ]
          },
          {
            "id": 3377,
            "name": "Ngakawau",
            "adjacent": [
              2582,
              3377
            ]
          },
          {
            "id": 2824,
            "name": "Punakaiki",
            "adjacent": [
              2824
            ]
          },
          {
            "id": 2464,
            "name": "Reefton",
            "adjacent": [
              2464
            ]
          },
          {
            "id": 3123,
            "name": "Seddonville",
            "adjacent": [
              3123
            ]
          },
          {
            "id": 2467,
            "name": "Springs Junction",
            "adjacent": [
              2467
            ]
          },
          {
            "id": 2581,
            "name": "Waimangaroa",
            "adjacent": [
              2581
            ]
          },
          {
            "id": 2460,
            "name": "Westport",
            "adjacent": [
              2460
            ]
          }
        ]
      },
      {
        "id": 56,
        "name": "Grey",
        "suburbs": [
          {
            "id": 2473,
            "name": "Ahaura",
            "adjacent": [
              2473
            ]
          },
          {
            "id": 2825,
            "name": "Barrytown",
            "adjacent": [
              2825
            ]
          },
          {
            "id": 2471,
            "name": "Blackball",
            "adjacent": [
              2471
            ]
          },
          {
            "id": 3066,
            "name": "Blaketown",
            "adjacent": [
              3066,
              3068,
              2481
            ]
          },
          {
            "id": 3157,
            "name": "Camerons",
            "adjacent": [
              3157
            ]
          },
          {
            "id": 3068,
            "name": "Cobden",
            "adjacent": [
              3066,
              3068
            ]
          },
          {
            "id": 2475,
            "name": "Dobson",
            "adjacent": [
              3163,
              2475
            ]
          },
          {
            "id": 3158,
            "name": "Dunollie",
            "adjacent": [
              3158,
              2480
            ]
          },
          {
            "id": 3803,
            "name": "Gladstone",
            "adjacent": [
              3803
            ]
          },
          {
            "id": 2481,
            "name": "Greymouth",
            "adjacent": [
              3066,
              3086,
              2481
            ]
          },
          {
            "id": 2465,
            "name": "Ikamatua",
            "adjacent": [
              2465
            ]
          },
          {
            "id": 3728,
            "name": "Inchbonnie",
            "adjacent": [
              3728
            ]
          },
          {
            "id": 3878,
            "name": "Kaiata",
            "adjacent": [
              3878
            ]
          },
          {
            "id": 3086,
            "name": "Karoro",
            "adjacent": [
              3086,
              3110,
              2481
            ]
          },
          {
            "id": 3227,
            "name": "Lake Brunner",
            "adjacent": [
              3227
            ]
          },
          {
            "id": 3629,
            "name": "Marsden",
            "adjacent": [
              3629
            ]
          },
          {
            "id": 2382,
            "name": "Moana",
            "adjacent": [
              2382,
              2399
            ]
          },
          {
            "id": 3160,
            "name": "Nelson Creek",
            "adjacent": [
              3160
            ]
          },
          {
            "id": 2474,
            "name": "Ngahere",
            "adjacent": [
              2474
            ]
          },
          {
            "id": 2482,
            "name": "Paroa",
            "adjacent": [
              2482
            ]
          },
          {
            "id": 3161,
            "name": "Rapahoe",
            "adjacent": [
              3161
            ]
          },
          {
            "id": 2480,
            "name": "Runanga",
            "adjacent": [
              3158,
              2480
            ]
          },
          {
            "id": 3162,
            "name": "Rutherglen",
            "adjacent": [
              3162
            ]
          },
          {
            "id": 3110,
            "name": "South Beach",
            "adjacent": [
              3086,
              3110
            ]
          },
          {
            "id": 3163,
            "name": "Taylorville",
            "adjacent": [
              3163,
              2475
            ]
          },
          {
            "id": 3155,
            "name": "Totara Flat",
            "adjacent": [
              3155
            ]
          }
        ]
      },
      {
        "id": 57,
        "name": "Westland",
        "suburbs": [
          {
            "id": 3692,
            "name": "Arahura Valley",
            "adjacent": [
              3692
            ]
          },
          {
            "id": 3482,
            "name": "Awatuna",
            "adjacent": [
              3482
            ]
          },
          {
            "id": 3156,
            "name": "Bruce Bay",
            "adjacent": [
              3156
            ]
          },
          {
            "id": 2363,
            "name": "Fox Glacier",
            "adjacent": [
              2363
            ]
          },
          {
            "id": 2443,
            "name": "Franz Josef",
            "adjacent": [
              2443
            ]
          },
          {
            "id": 3079,
            "name": "Haast",
            "adjacent": [
              3079
            ]
          },
          {
            "id": 2361,
            "name": "Harihari",
            "adjacent": [
              2361
            ]
          },
          {
            "id": 2489,
            "name": "Hokitika",
            "adjacent": [
              2489
            ]
          },
          {
            "id": 3794,
            "name": "Jacksons",
            "adjacent": [
              3794
            ]
          },
          {
            "id": 2386,
            "name": "Kaniere",
            "adjacent": [
              2386
            ]
          },
          {
            "id": 3159,
            "name": "Kokatahi",
            "adjacent": [
              3159
            ]
          },
          {
            "id": 2332,
            "name": "Kowhitirangi",
            "adjacent": [
              2332
            ]
          },
          {
            "id": 2483,
            "name": "Kumara",
            "adjacent": [
              2483
            ]
          },
          {
            "id": 3717,
            "name": "Kumara Junction",
            "adjacent": [
              3717
            ]
          },
          {
            "id": 2399,
            "name": "Moana",
            "adjacent": [
              2382,
              2399
            ]
          },
          {
            "id": 3378,
            "name": "Okarito",
            "adjacent": [
              3378
            ]
          },
          {
            "id": 2364,
            "name": "Okuru",
            "adjacent": [
              2364
            ]
          },
          {
            "id": 3790,
            "name": "Otira",
            "adjacent": [
              3790
            ]
          },
          {
            "id": 2360,
            "name": "Pukekura",
            "adjacent": [
              2360
            ]
          },
          {
            "id": 2333,
            "name": "Ross",
            "adjacent": [
              2333
            ]
          },
          {
            "id": 3314,
            "name": "Whataroa ",
            "adjacent": [
              3314
            ]
          }
        ]
      }
    ]
  },
  {
    "id": 3,
    "name": "Canterbury",
    "districts": [
      {
        "id": 63,
        "name": "Ashburton",
        "suburbs": [
          {
            "id": 3574,
            "name": "Allenton",
            "adjacent": [
              3574
            ]
          },
          {
            "id": 2337,
            "name": "Ashburton",
            "adjacent": [
              2337,
              2498,
              3702
            ]
          },
          {
            "id": 1438,
            "name": "Chertsey",
            "adjacent": [
              1438
            ]
          },
          {
            "id": 3881,
            "name": "Elgin",
            "adjacent": [
              3881,
              1437,
              3818
            ]
          },
          {
            "id": 1437,
            "name": "Fairton",
            "adjacent": [
              1437,
              3703,
              3818,
              3881
            ]
          },
          {
            "id": 3702,
            "name": "Hampstead",
            "adjacent": [
              3702,
              2337
            ]
          },
          {
            "id": 2497,
            "name": "Hinds",
            "adjacent": [
              2497
            ]
          },
          {
            "id": 3730,
            "name": "Huntingdon",
            "adjacent": [
              3730
            ]
          },
          {
            "id": 3883,
            "name": "Lauriston",
            "adjacent": [
              3883
            ]
          },
          {
            "id": 2354,
            "name": "Mayfield",
            "adjacent": [
              2354
            ]
          },
          {
            "id": 2358,
            "name": "Methven",
            "adjacent": [
              2358
            ]
          },
          {
            "id": 2355,
            "name": "Montalto",
            "adjacent": [
              2355
            ]
          },
          {
            "id": 3359,
            "name": "Mt Somers",
            "adjacent": [
              3359
            ]
          },
          {
            "id": 3703,
            "name": "Netherby",
            "adjacent": [
              3703,
              1437,
              3818
            ]
          },
          {
            "id": 3818,
            "name": "Newland",
            "adjacent": [
              3818,
              1437,
              3703,
              3881
            ]
          },
          {
            "id": 2137,
            "name": "Rakaia",
            "adjacent": [
              2137
            ]
          },
          {
            "id": 2498,
            "name": "Tinwald",
            "adjacent": [
              2337,
              2498
            ]
          },
          {
            "id": 3584,
            "name": "Willowby",
            "adjacent": [
              3584,
              3583
            ]
          }
        ]
      },
      {
        "id": 61,
        "name": "Banks Peninsula",
        "suburbs": [
          {
            "id": 2255,
            "name": "Akaroa",
            "adjacent": [
              2255
            ]
          },
          {
            "id": 3504,
            "name": "Birdlings Flat",
            "adjacent": [
              3504
            ]
          },
          {
            "id": 2262,
            "name": "Cass Bay",
            "adjacent": [
              2262,
              2265
            ]
          },
          {
            "id": 3432,
            "name": "Charteris Bay",
            "adjacent": [
              2260,
              3432
            ]
          },
          {
            "id": 2260,
            "name": "Diamond Harbour",
            "adjacent": [
              2260,
              3432,
              2476
            ]
          },
          {
            "id": 2258,
            "name": "Duvauchelle",
            "adjacent": [
              2258
            ]
          },
          {
            "id": 2341,
            "name": "Governors Bay",
            "adjacent": [
              2341
            ]
          },
          {
            "id": 3497,
            "name": "Little Akaloa",
            "adjacent": [
              3497
            ]
          },
          {
            "id": 2253,
            "name": "Little River",
            "adjacent": [
              2253
            ]
          },
          {
            "id": 2265,
            "name": "Lyttelton",
            "adjacent": [
              2262,
              2265
            ]
          },
          {
            "id": 2150,
            "name": "Motukarara",
            "adjacent": [
              2150
            ]
          },
          {
            "id": 3573,
            "name": "Okains Bay",
            "adjacent": [
              3573
            ]
          },
          {
            "id": 3445,
            "name": "Pigeon Bay",
            "adjacent": [
              3445
            ]
          },
          {
            "id": 2259,
            "name": "Port Levy",
            "adjacent": [
              2259
            ]
          },
          {
            "id": 2476,
            "name": "Purau",
            "adjacent": [
              2260,
              2476
            ]
          },
          {
            "id": 3433,
            "name": "Teddington",
            "adjacent": [
              3433
            ]
          },
          {
            "id": 2254,
            "name": "Wainui",
            "adjacent": [
              2254
            ]
          }
        ]
      },
      {
        "id": 60,
        "name": "Christchurch City",
        "suburbs": [
          {
            "id": 2189,
            "name": "Addington",
            "adjacent": [
              2338,
              2189,
              1993,
              2178,
              2180,
              3253
            ]
          },
          {
            "id": 3326,
            "name": "Aidanfield",
            "adjacent": [
              2046,
              3326,
              2233,
              2236,
              2149
            ]
          },
          {
            "id": 2031,
            "name": "Aranui",
            "adjacent": [
              2030,
              2031,
              2032,
              2034,
              2043,
              2342,
              2390
            ]
          },
          {
            "id": 2030,
            "name": "Avondale",
            "adjacent": [
              2030,
              2031,
              2342,
              1994,
              1995,
              2390
            ]
          },
          {
            "id": 2504,
            "name": "Avonhead",
            "adjacent": [
              2504,
              2505,
              2512,
              2058,
              2500,
              2165,
              2501,
              3305
            ]
          },
          {
            "id": 2388,
            "name": "Avonside",
            "adjacent": [
              2213,
              2216,
              1994,
              2238,
              2388,
              2389,
              2390
            ]
          },
          {
            "id": 1969,
            "name": "Balmoral Hill",
            "adjacent": [
              2044,
              2266,
              2434,
              2435,
              2436,
              2437,
              1968,
              1969
            ]
          },
          {
            "id": 3253,
            "name": "Barrington",
            "adjacent": [
              2338,
              2189,
              3379,
              3391,
              2235,
              2178,
              2179,
              2180,
              3253
            ]
          },
          {
            "id": 2338,
            "name": "Beckenham",
            "adjacent": [
              2338,
              2182,
              2183,
              2186,
              2187,
              2188,
              2189,
              2178,
              2179,
              2180,
              3253
            ]
          },
          {
            "id": 2039,
            "name": "Belfast",
            "adjacent": [
              2039,
              3277
            ]
          },
          {
            "id": 2342,
            "name": "Bexley",
            "adjacent": [
              2030,
              2031,
              2032,
              2034,
              2043,
              2342,
              2390
            ]
          },
          {
            "id": 2507,
            "name": "Bishopdale",
            "adjacent": [
              2557,
              2505,
              2506,
              2507,
              3371,
              2501,
              2508
            ]
          },
          {
            "id": 2237,
            "name": "Bromley",
            "adjacent": [
              2185,
              2217,
              2455,
              3325,
              2237,
              2389,
              2390
            ]
          },
          {
            "id": 3325,
            "name": "Brookhaven",
            "adjacent": [
              2184,
              2185,
              2217,
              2437,
              2455,
              3325,
              2237
            ]
          },
          {
            "id": 2317,
            "name": "Brooklands",
            "adjacent": [
              2317,
              2318,
              2375,
              3260,
              2395,
              2396
            ]
          },
          {
            "id": 2500,
            "name": "Broomfield",
            "adjacent": [
              2504,
              2512,
              2058,
              2500,
              2144,
              2145,
              2146,
              2501
            ]
          },
          {
            "id": 2280,
            "name": "Bryndwr",
            "adjacent": [
              2557,
              2558,
              2101,
              2280,
              2505,
              3322,
              3454
            ]
          },
          {
            "id": 2505,
            "name": "Burnside",
            "adjacent": [
              2101,
              2280,
              2504,
              2505,
              2507,
              2501,
              2165
            ]
          },
          {
            "id": 1995,
            "name": "Burwood",
            "adjacent": [
              2030,
              1994,
              1995,
              2391
            ]
          },
          {
            "id": 2508,
            "name": "Casebrook",
            "adjacent": [
              2506,
              2508,
              2511,
              3371,
              2507
            ]
          },
          {
            "id": 2181,
            "name": "Cashmere",
            "adjacent": [
              2182,
              2187,
              3379,
              3391,
              2179,
              2181
            ]
          },
          {
            "id": 2040,
            "name": "Chaneys",
            "adjacent": [
              2040,
              2041
            ]
          },
          {
            "id": 2212,
            "name": "City Centre",
            "adjacent": [
              2212,
              2213,
              2214,
              2216,
              3345,
              2238,
              2180
            ]
          },
          {
            "id": 2435,
            "name": "Clifton",
            "adjacent": [
              2434,
              2435,
              2436,
              1968,
              1969,
              2065,
              2067
            ]
          },
          {
            "id": 3379,
            "name": "Cracroft",
            "adjacent": [
              3379,
              3391,
              2234,
              2235,
              2179,
              2181,
              3253
            ]
          },
          {
            "id": 1994,
            "name": "Dallington",
            "adjacent": [
              2030,
              2213,
              1994,
              1995,
              2238,
              2388,
              2389,
              2390,
              2391
            ]
          },
          {
            "id": 3345,
            "name": "Edgeware",
            "adjacent": [
              2558,
              2212,
              2213,
              2214,
              2215,
              3322,
              3345
            ]
          },
          {
            "id": 3394,
            "name": "Eyreton",
            "adjacent": [
              3394
            ]
          },
          {
            "id": 2101,
            "name": "Fendalton",
            "adjacent": [
              2101,
              2280,
              2505,
              3454,
              1993,
              2165,
              2177
            ]
          },
          {
            "id": 2217,
            "name": "Ferrymead",
            "adjacent": [
              2184,
              2185,
              2217,
              2266,
              2437,
              2455,
              3325,
              2237
            ]
          },
          {
            "id": 3273,
            "name": "Forest Park",
            "adjacent": [
              2033,
              2035,
              3217,
              3273,
              3279,
              3453,
              3531
            ]
          },
          {
            "id": 2149,
            "name": "Halswell",
            "adjacent": [
              3326,
              2233,
              2149
            ]
          },
          {
            "id": 2506,
            "name": "Harewood",
            "adjacent": [
              2557,
              2506,
              2507,
              2508,
              3371,
              2501,
              3277
            ]
          },
          {
            "id": 2455,
            "name": "Heathcote",
            "adjacent": [
              2183,
              2184,
              2185,
              2186,
              2188,
              2217,
              2455,
              3325,
              2237
            ]
          },
          {
            "id": 2144,
            "name": "Hei Hei",
            "adjacent": [
              2339,
              3139,
              2500,
              2144,
              2145,
              2146
            ]
          },
          {
            "id": 2236,
            "name": "Hillmorton",
            "adjacent": [
              3326,
              2235,
              2236
            ]
          },
          {
            "id": 2184,
            "name": "Hillsborough",
            "adjacent": [
              2182,
              2183,
              2184,
              2185,
              2186,
              2187,
              2217,
              2455,
              3325
            ]
          },
          {
            "id": 2235,
            "name": "Hoon Hay",
            "adjacent": [
              3379,
              3391,
              2234,
              2235,
              2236,
              2178,
              3253
            ]
          },
          {
            "id": 2146,
            "name": "Hornby",
            "adjacent": [
              2339,
              3139,
              2500,
              2144,
              2145,
              2146
            ]
          },
          {
            "id": 2182,
            "name": "Huntsbury",
            "adjacent": [
              2338,
              2182,
              2183,
              2184,
              2186,
              2187,
              2179,
              2181
            ]
          },
          {
            "id": 2512,
            "name": "Hyde Park",
            "adjacent": [
              2504,
              2512,
              2500,
              2501,
              2165
            ]
          },
          {
            "id": 2165,
            "name": "Ilam",
            "adjacent": [
              2101,
              2504,
              2505,
              2512,
              2058,
              2165,
              2177
            ]
          },
          {
            "id": 2145,
            "name": "Islington",
            "adjacent": [
              2500,
              2144,
              2145,
              2146,
              2453
            ]
          },
          {
            "id": 2308,
            "name": "Kainga",
            "adjacent": [
              2308,
              3376
            ]
          },
          {
            "id": 3508,
            "name": "Kennedy's Bush",
            "adjacent": [
              3508
            ]
          },
          {
            "id": 2238,
            "name": "Linwood",
            "adjacent": [
              2188,
              2212,
              2213,
              2216,
              1994,
              2238,
              2180,
              2388,
              2389
            ]
          },
          {
            "id": 2215,
            "name": "Mairehau",
            "adjacent": [
              2213,
              2214,
              2215,
              3322,
              3345,
              2391
            ]
          },
          {
            "id": 2042,
            "name": "Marshland",
            "adjacent": [
              2042,
              2511,
              3531
            ]
          },
          {
            "id": 2558,
            "name": "Merivale",
            "adjacent": [
              2558,
              2214,
              2280,
              3322,
              3345,
              3454,
              1993
            ]
          },
          {
            "id": 2057,
            "name": "Middleton",
            "adjacent": [
              2339,
              3139,
              2057,
              2058,
              2177
            ]
          },
          {
            "id": 2436,
            "name": "Moncks Bay",
            "adjacent": [
              2434,
              2435,
              2436,
              1968,
              1969,
              2065,
              2067
            ]
          },
          {
            "id": 2266,
            "name": "Mount Pleasant",
            "adjacent": [
              2217,
              2266,
              2437,
              1968,
              1969
            ]
          },
          {
            "id": 2183,
            "name": "Murray Aynsley",
            "adjacent": [
              2338,
              2182,
              2183,
              2184,
              2185,
              2186,
              2187,
              2188,
              2455
            ]
          },
          {
            "id": 2034,
            "name": "New Brighton",
            "adjacent": [
              2031,
              2032,
              2034,
              2043,
              2342
            ]
          },
          {
            "id": 2389,
            "name": "North Linwood",
            "adjacent": [
              2185,
              2188,
              2213,
              2216,
              1994,
              2237,
              2238,
              2388,
              2389,
              2390
            ]
          },
          {
            "id": 2032,
            "name": "North New Brighton",
            "adjacent": [
              2031,
              2032,
              2034,
              2043,
              2342
            ]
          },
          {
            "id": 3371,
            "name": "Northcote",
            "adjacent": [
              2557,
              2506,
              2507,
              2508,
              2511,
              3371
            ]
          },
          {
            "id": 3453,
            "name": "Northshore",
            "adjacent": [
              2033,
              2035,
              3217,
              3273,
              3279,
              3453
            ]
          },
          {
            "id": 3277,
            "name": "Northwood ",
            "adjacent": [
              2039,
              3277,
              2506
            ]
          },
          {
            "id": 2233,
            "name": "Oaklands",
            "adjacent": [
              2046,
              3326,
              2233,
              2149
            ]
          },
          {
            "id": 2186,
            "name": "Opawa",
            "adjacent": [
              2338,
              2182,
              2183,
              2184,
              2185,
              2186,
              2187,
              2188,
              2455
            ]
          },
          {
            "id": 2557,
            "name": "Papanui",
            "adjacent": [
              2557,
              2280,
              2506,
              2507,
              3322,
              3371,
              3454
            ]
          },
          {
            "id": 2035,
            "name": "Parklands",
            "adjacent": [
              2033,
              2035,
              3217,
              3273,
              3279,
              3453,
              3531
            ]
          },
          {
            "id": 2216,
            "name": "Phillipstown",
            "adjacent": [
              2185,
              2188,
              2212,
              2213,
              2216,
              2238,
              2180,
              2388,
              2389
            ]
          },
          {
            "id": 3279,
            "name": "Queenspark",
            "adjacent": [
              2033,
              2035,
              3217,
              3273,
              3279,
              3453,
              3531
            ]
          },
          {
            "id": 3701,
            "name": "Ravenswood",
            "adjacent": [
              3701,
              3410,
              3700,
              2514
            ]
          },
          {
            "id": 1968,
            "name": "Redcliffs",
            "adjacent": [
              2044,
              2266,
              2434,
              2435,
              2436,
              2437,
              1968,
              1969
            ]
          },
          {
            "id": 2511,
            "name": "Redwood",
            "adjacent": [
              2042,
              2508,
              2511,
              3371
            ]
          },
          {
            "id": 1993,
            "name": "Riccarton",
            "adjacent": [
              2558,
              2101,
              2189,
              1993,
              2177
            ]
          },
          {
            "id": 2213,
            "name": "Richmond",
            "adjacent": [
              2212,
              2213,
              2214,
              2215,
              2216,
              3345,
              1994,
              2238,
              2388,
              2389,
              2391
            ]
          },
          {
            "id": 2434,
            "name": "Richmond Hill",
            "adjacent": [
              2434,
              2435,
              2436,
              1968,
              1969,
              2065,
              2067
            ]
          },
          {
            "id": 2501,
            "name": "Russley",
            "adjacent": [
              2505,
              2506,
              2507,
              2512,
              2501,
              2504,
              2500,
              3305
            ]
          },
          {
            "id": 2065,
            "name": "Scarborough",
            "adjacent": [
              2434,
              2435,
              2436,
              2065,
              2067
            ]
          },
          {
            "id": 2391,
            "name": "Shirley",
            "adjacent": [
              2213,
              2215,
              1994,
              1995,
              2391
            ]
          },
          {
            "id": 2058,
            "name": "Sockburn",
            "adjacent": [
              2339,
              2504,
              3139,
              2057,
              2058,
              2500,
              2165,
              2177
            ]
          },
          {
            "id": 2179,
            "name": "Somerfield",
            "adjacent": [
              2338,
              2182,
              2187,
              3379,
              3391,
              2178,
              2179,
              2180,
              2181,
              3253
            ]
          },
          {
            "id": 2043,
            "name": "South New Brighton",
            "adjacent": [
              2031,
              2032,
              2034,
              2043,
              2342
            ]
          },
          {
            "id": 2044,
            "name": "Southshore",
            "adjacent": [
              2044,
              1968,
              1969
            ]
          },
          {
            "id": 2309,
            "name": "Spencerville",
            "adjacent": [
              2309,
              3531
            ]
          },
          {
            "id": 2178,
            "name": "Spreydon",
            "adjacent": [
              2338,
              2189,
              2235,
              2178,
              2179,
              2180,
              3253
            ]
          },
          {
            "id": 2214,
            "name": "St. Albans",
            "adjacent": [
              2558,
              2212,
              2213,
              2214,
              2215,
              3322,
              3345,
              3454
            ]
          },
          {
            "id": 2437,
            "name": "St. Andrews Hill",
            "adjacent": [
              2217,
              2266,
              2437,
              3325,
              1968,
              1969
            ]
          },
          {
            "id": 2187,
            "name": "St. Martins",
            "adjacent": [
              2338,
              2182,
              2183,
              2184,
              2186,
              2187,
              2188,
              2179,
              2180,
              2181
            ]
          },
          {
            "id": 3376,
            "name": "Stewarts Gully",
            "adjacent": [
              2308,
              3112,
              3376
            ]
          },
          {
            "id": 3454,
            "name": "Strowan",
            "adjacent": [
              2557,
              2558,
              2101,
              2214,
              2280,
              3322,
              3454
            ]
          },
          {
            "id": 3112,
            "name": "Styx",
            "adjacent": [
              3112,
              3376
            ]
          },
          {
            "id": 2067,
            "name": "Sumner",
            "adjacent": [
              2434,
              2435,
              2436,
              2065,
              2067
            ]
          },
          {
            "id": 2180,
            "name": "Sydenham",
            "adjacent": [
              2338,
              2187,
              2188,
              2189,
              2212,
              2216,
              2238,
              2178,
              2179,
              2180,
              3253
            ]
          },
          {
            "id": 2453,
            "name": "Templeton",
            "adjacent": [
              2453,
              2145,
              3305
            ]
          },
          {
            "id": 2177,
            "name": "Upper Riccarton",
            "adjacent": [
              2101,
              1993,
              2057,
              2058,
              2165,
              2177
            ]
          },
          {
            "id": 2033,
            "name": "Waimairi Beach",
            "adjacent": [
              2033,
              2035,
              3217,
              3273,
              3279,
              3453
            ]
          },
          {
            "id": 2390,
            "name": "Wainoni",
            "adjacent": [
              2030,
              2031,
              2342,
              1994,
              2237,
              2388,
              2389,
              2390
            ]
          },
          {
            "id": 3531,
            "name": "Waitikiri",
            "adjacent": [
              2035,
              2309,
              3273,
              3279,
              3531,
              2042
            ]
          },
          {
            "id": 2188,
            "name": "Waltham",
            "adjacent": [
              2338,
              2183,
              2185,
              2186,
              2187,
              2188,
              2216,
              2455,
              2238,
              2180,
              2389
            ]
          },
          {
            "id": 2046,
            "name": "Westlake",
            "adjacent": [
              2339,
              2046,
              3139,
              3326,
              2233
            ]
          },
          {
            "id": 2234,
            "name": "Westmorland",
            "adjacent": [
              3379,
              3391,
              2234,
              2235
            ]
          },
          {
            "id": 3139,
            "name": "Wigram",
            "adjacent": [
              2339,
              2046,
              3139,
              2057,
              2058,
              2144,
              2146
            ]
          },
          {
            "id": 2339,
            "name": "Wigram Park",
            "adjacent": [
              2339,
              2046,
              3139,
              2057,
              2058,
              2144,
              2146
            ]
          },
          {
            "id": 2185,
            "name": "Woolston",
            "adjacent": [
              2183,
              2184,
              2185,
              2186,
              2188,
              2216,
              2217,
              2455,
              3325,
              2237,
              2389
            ]
          },
          {
            "id": 3305,
            "name": "Yaldhurst ",
            "adjacent": [
              3305,
              2453,
              2504,
              2501
            ]
          }
        ]
      },
      {
        "id": 58,
        "name": "Hurunui",
        "suburbs": [
          {
            "id": 2249,
            "name": "Amberley",
            "adjacent": [
              2249,
              3418
            ]
          },
          {
            "id": 3218,
            "name": "Amberley Beach",
            "adjacent": [
              3218
            ]
          },
          {
            "id": 3418,
            "name": "Balcairn",
            "adjacent": [
              3418,
              2249
            ]
          },
          {
            "id": 1541,
            "name": "Cheviot",
            "adjacent": [
              1544,
              1541
            ]
          },
          {
            "id": 1542,
            "name": "Culverden",
            "adjacent": [
              1542,
              3360,
              3516
            ]
          },
          {
            "id": 1544,
            "name": "Domett",
            "adjacent": [
              1544,
              1541
            ]
          },
          {
            "id": 3395,
            "name": "Gore Bay",
            "adjacent": [
              3395
            ]
          },
          {
            "id": 3357,
            "name": "Greta Valley",
            "adjacent": [
              3357
            ]
          },
          {
            "id": 1543,
            "name": "Hanmer Springs",
            "adjacent": [
              1543,
              3516
            ]
          },
          {
            "id": 2615,
            "name": "Hawarden",
            "adjacent": [
              2615
            ]
          },
          {
            "id": 3219,
            "name": "Leithfield",
            "adjacent": [
              3219,
              2250
            ]
          },
          {
            "id": 2250,
            "name": "Leithfield Beach",
            "adjacent": [
              3219,
              2250
            ]
          },
          {
            "id": 3356,
            "name": "Lewis Pass",
            "adjacent": [
              3356
            ]
          },
          {
            "id": 3516,
            "name": "Lyford",
            "adjacent": [
              1539,
              1542,
              1543,
              2276,
              3425,
              3516
            ]
          },
          {
            "id": 2273,
            "name": "Motunau",
            "adjacent": [
              2273
            ]
          },
          {
            "id": 3425,
            "name": "Oaro",
            "adjacent": [
              2276,
              3425,
              3516
            ]
          },
          {
            "id": 2276,
            "name": "Omihi",
            "adjacent": [
              2276,
              3425,
              3516
            ]
          },
          {
            "id": 3360,
            "name": "Rotherham",
            "adjacent": [
              1542,
              3360
            ]
          },
          {
            "id": 3358,
            "name": "Scargill",
            "adjacent": [
              3358
            ]
          },
          {
            "id": 1539,
            "name": "Waiau",
            "adjacent": [
              1539,
              3516
            ]
          },
          {
            "id": 2163,
            "name": "Waikari",
            "adjacent": [
              2163
            ]
          },
          {
            "id": 2277,
            "name": "Waipara",
            "adjacent": [
              2277
            ]
          }
        ]
      },
      {
        "id": 65,
        "name": "Mackenzie",
        "suburbs": [
          {
            "id": 3485,
            "name": "Albury",
            "adjacent": [
              3485
            ]
          },
          {
            "id": 3318,
            "name": "Burkes Pass ",
            "adjacent": [
              3318
            ]
          },
          {
            "id": 2275,
            "name": "Cave",
            "adjacent": [
              2275
            ]
          },
          {
            "id": 2407,
            "name": "Fairlie",
            "adjacent": [
              2407
            ]
          },
          {
            "id": 2550,
            "name": "Lake Tekapo",
            "adjacent": [
              2550
            ]
          },
          {
            "id": 3455,
            "name": "Mt Cook",
            "adjacent": [
              3455
            ]
          },
          {
            "id": 2219,
            "name": "Twizel",
            "adjacent": [
              2334,
              2219
            ]
          }
        ]
      },
      {
        "id": 62,
        "name": "Selwyn",
        "suburbs": [
          {
            "id": 3427,
            "name": "Annat",
            "adjacent": [
              3427
            ]
          },
          {
            "id": 2614,
            "name": "Arthurs Pass",
            "adjacent": [
              2614
            ]
          },
          {
            "id": 3396,
            "name": "Broadfield",
            "adjacent": [
              3396
            ]
          },
          {
            "id": 2003,
            "name": "Burnham",
            "adjacent": [
              2003
            ]
          },
          {
            "id": 3431,
            "name": "Castle Hill Village",
            "adjacent": [
              3431
            ]
          },
          {
            "id": 3428,
            "name": "Charing Cross",
            "adjacent": [
              3428
            ]
          },
          {
            "id": 2279,
            "name": "Coalgate",
            "adjacent": [
              2279
            ]
          },
          {
            "id": 2278,
            "name": "Darfield",
            "adjacent": [
              2278
            ]
          },
          {
            "id": 3286,
            "name": "Doyleston",
            "adjacent": [
              3286
            ]
          },
          {
            "id": 2002,
            "name": "Dunsandel",
            "adjacent": [
              2002
            ]
          },
          {
            "id": 3509,
            "name": "Glentunnel",
            "adjacent": [
              3509
            ]
          },
          {
            "id": 2312,
            "name": "Greendale",
            "adjacent": [
              2312
            ]
          },
          {
            "id": 2311,
            "name": "Hororata",
            "adjacent": [
              2311
            ]
          },
          {
            "id": 3409,
            "name": "Irwell",
            "adjacent": [
              3409
            ]
          },
          {
            "id": 2454,
            "name": "Kirwee",
            "adjacent": [
              2454
            ]
          },
          {
            "id": 3430,
            "name": "Kowai Bush",
            "adjacent": [
              3430
            ]
          },
          {
            "id": 2314,
            "name": "Lake Coleridge",
            "adjacent": [
              2314
            ]
          },
          {
            "id": 2049,
            "name": "Lake Ellesmere",
            "adjacent": [
              2049
            ]
          },
          {
            "id": 2001,
            "name": "Leeston",
            "adjacent": [
              2001
            ]
          },
          {
            "id": 2005,
            "name": "Lincoln",
            "adjacent": [
              2005
            ]
          },
          {
            "id": 2147,
            "name": "Prebbleton",
            "adjacent": [
              2147
            ]
          },
          {
            "id": 2004,
            "name": "Rolleston",
            "adjacent": [
              2004,
              2406
            ]
          },
          {
            "id": 3429,
            "name": "Russells Flat",
            "adjacent": [
              3429
            ]
          },
          {
            "id": 2419,
            "name": "Sheffield",
            "adjacent": [
              2419,
              3829
            ]
          },
          {
            "id": 1999,
            "name": "Southbridge",
            "adjacent": [
              1999
            ]
          },
          {
            "id": 2418,
            "name": "Springfield",
            "adjacent": [
              2418
            ]
          },
          {
            "id": 2006,
            "name": "Springston",
            "adjacent": [
              2006
            ]
          },
          {
            "id": 2007,
            "name": "Tai Tapu",
            "adjacent": [
              2007
            ]
          },
          {
            "id": 3829,
            "name": "Waddington",
            "adjacent": [
              3829,
              2419
            ]
          },
          {
            "id": 2406,
            "name": "Weedons",
            "adjacent": [
              2004,
              2406
            ]
          },
          {
            "id": 2404,
            "name": "West Melton",
            "adjacent": [
              2404
            ]
          },
          {
            "id": 2359,
            "name": "Windwhistle",
            "adjacent": [
              2359
            ]
          }
        ]
      },
      {
        "id": 64,
        "name": "Timaru",
        "suburbs": [
          {
            "id": 2047,
            "name": "Arundel",
            "adjacent": [
              2047,
              3421
            ]
          },
          {
            "id": 3828,
            "name": "Claremont",
            "adjacent": [
              3828
            ]
          },
          {
            "id": 2408,
            "name": "Geraldine",
            "adjacent": [
              2408
            ]
          },
          {
            "id": 3679,
            "name": "Gleniti",
            "adjacent": [
              3679,
              2292,
              3680,
              3681
            ]
          },
          {
            "id": 3680,
            "name": "Glenwood",
            "adjacent": [
              3680,
              3679,
              3676,
              2292,
              3681,
              3690
            ]
          },
          {
            "id": 3681,
            "name": "Highfield",
            "adjacent": [
              3681,
              3679,
              3680,
              3676,
              2292,
              3685,
              3688,
              3689,
              3690,
              3721
            ]
          },
          {
            "id": 3708,
            "name": "Kensington",
            "adjacent": [
              3708,
              3683,
              3684,
              3685,
              3689
            ]
          },
          {
            "id": 3547,
            "name": "Kerrytown",
            "adjacent": [
              3547
            ]
          },
          {
            "id": 3546,
            "name": "Levels",
            "adjacent": [
              3546
            ]
          },
          {
            "id": 3721,
            "name": "Maori Hill",
            "adjacent": [
              3721,
              3681,
              3676,
              3682,
              3683,
              3685,
              3686,
              2292,
              3687,
              3688,
              3689,
              3690
            ]
          },
          {
            "id": 3676,
            "name": "Marchwiel",
            "adjacent": [
              3676,
              2292,
              2243,
              3680,
              3681,
              3682,
              3686,
              3688,
              3690,
              3721
            ]
          },
          {
            "id": 3682,
            "name": "Oceanview",
            "adjacent": [
              3682,
              3676,
              2292,
              2243,
              3686,
              3688,
              3721
            ]
          },
          {
            "id": 3562,
            "name": "Orari",
            "adjacent": [
              3562
            ]
          },
          {
            "id": 2365,
            "name": "Pareora",
            "adjacent": [
              2365
            ]
          },
          {
            "id": 3683,
            "name": "Parkside",
            "adjacent": [
              3683,
              3684,
              3685,
              3687,
              3689,
              3690,
              3708,
              3721
            ]
          },
          {
            "id": 2229,
            "name": "Pleasant Point",
            "adjacent": [
              2229
            ]
          },
          {
            "id": 3823,
            "name": "Rangitata",
            "adjacent": [
              3823
            ]
          },
          {
            "id": 3684,
            "name": "Redruth",
            "adjacent": [
              3684,
              3683,
              3689,
              3708
            ]
          },
          {
            "id": 3623,
            "name": "Rosewill",
            "adjacent": [
              3623
            ]
          },
          {
            "id": 3824,
            "name": "Seadown",
            "adjacent": [
              3824
            ]
          },
          {
            "id": 3685,
            "name": "Seaview",
            "adjacent": [
              3685,
              3681,
              3683,
              3687,
              3688,
              3689,
              3690,
              3708,
              3721
            ]
          },
          {
            "id": 3686,
            "name": "Smithfield",
            "adjacent": [
              3686,
              3676,
              3682,
              2243,
              3688,
              3721
            ]
          },
          {
            "id": 3324,
            "name": "St Andrews",
            "adjacent": [
              2291,
              3324
            ]
          },
          {
            "id": 2228,
            "name": "Temuka",
            "adjacent": [
              2228
            ]
          },
          {
            "id": 2292,
            "name": "Timaru",
            "adjacent": [
              2292,
              3676,
              3679,
              3680,
              3681,
              3682,
              3688,
              3690,
              3721
            ]
          },
          {
            "id": 3687,
            "name": "Timaru Port",
            "adjacent": [
              3687,
              3683,
              3685,
              3688,
              3689,
              3690,
              3721
            ]
          },
          {
            "id": 3688,
            "name": "Waimataitai",
            "adjacent": [
              3688,
              3681,
              3676,
              3682,
              3685,
              3686,
              2292,
              3687,
              3690,
              3721
            ]
          },
          {
            "id": 2243,
            "name": "Washdyke",
            "adjacent": [
              2243,
              3676,
              3682,
              3686
            ]
          },
          {
            "id": 3689,
            "name": "Watlington",
            "adjacent": [
              3689,
              3681,
              3683,
              3684,
              3685,
              3687,
              3690,
              3708,
              3721
            ]
          },
          {
            "id": 3690,
            "name": "West End",
            "adjacent": [
              3690,
              3680,
              3681,
              3676,
              3683,
              3685,
              2292,
              3687,
              3688,
              3689,
              3721
            ]
          },
          {
            "id": 2208,
            "name": "Winchester",
            "adjacent": [
              2208
            ]
          }
        ]
      },
      {
        "id": 59,
        "name": "Waimakariri",
        "suburbs": [
          {
            "id": 2545,
            "name": "Ashley",
            "adjacent": [
              2545,
              2516
            ]
          },
          {
            "id": 2336,
            "name": "Ashley Gorge",
            "adjacent": [
              2336
            ]
          },
          {
            "id": 3419,
            "name": "Bennetts",
            "adjacent": [
              3419
            ]
          },
          {
            "id": 2417,
            "name": "Bexley",
            "adjacent": [
              2417
            ]
          },
          {
            "id": 3420,
            "name": "Burnt Hill",
            "adjacent": [
              3420
            ]
          },
          {
            "id": 2306,
            "name": "Carleton",
            "adjacent": [
              2306
            ]
          },
          {
            "id": 2218,
            "name": "Clarkville",
            "adjacent": [
              2218
            ]
          },
          {
            "id": 2516,
            "name": "Coldstream",
            "adjacent": [
              2545,
              2516
            ]
          },
          {
            "id": 3421,
            "name": "Coopers Creek",
            "adjacent": [
              2047,
              3421
            ]
          },
          {
            "id": 2041,
            "name": "Coutts Island",
            "adjacent": [
              2040,
              2041
            ]
          },
          {
            "id": 2307,
            "name": "Cust",
            "adjacent": [
              2307,
              2313,
              3216
            ]
          },
          {
            "id": 3422,
            "name": "Eyrewell",
            "adjacent": [
              3422
            ]
          },
          {
            "id": 2544,
            "name": "Fernside",
            "adjacent": [
              2544
            ]
          },
          {
            "id": 2542,
            "name": "Flaxton",
            "adjacent": [
              2542
            ]
          },
          {
            "id": 3423,
            "name": "Gammans Creek",
            "adjacent": [
              2305,
              3423
            ]
          },
          {
            "id": 3424,
            "name": "Glentui",
            "adjacent": [
              3424
            ]
          },
          {
            "id": 2313,
            "name": "Horrellville",
            "adjacent": [
              2307,
              2313,
              3216
            ]
          },
          {
            "id": 2543,
            "name": "Kaiapoi",
            "adjacent": [
              2543,
              2190
            ]
          },
          {
            "id": 3736,
            "name": "Kairaki",
            "adjacent": [
              3736,
              3365
            ]
          },
          {
            "id": 3328,
            "name": "Loburn",
            "adjacent": [
              3328
            ]
          },
          {
            "id": 2352,
            "name": "Loburn North",
            "adjacent": [
              2352
            ]
          },
          {
            "id": 2190,
            "name": "Ohapuku",
            "adjacent": [
              2543,
              2190
            ]
          },
          {
            "id": 2549,
            "name": "Ohoka",
            "adjacent": [
              2549
            ]
          },
          {
            "id": 3327,
            "name": "Okuku",
            "adjacent": [
              3327
            ]
          },
          {
            "id": 2305,
            "name": "Oxford",
            "adjacent": [
              2305,
              3423
            ]
          },
          {
            "id": 3410,
            "name": "Pegasus",
            "adjacent": [
              3410,
              3700,
              3701
            ]
          },
          {
            "id": 3217,
            "name": "Pegasus Bay",
            "adjacent": [
              2033,
              2035,
              3217,
              3273,
              3279,
              3453
            ]
          },
          {
            "id": 3365,
            "name": "Pines Beach",
            "adjacent": [
              3365,
              3736
            ]
          },
          {
            "id": 2515,
            "name": "Rangiora",
            "adjacent": [
              2541,
              2515
            ]
          },
          {
            "id": 3700,
            "name": "Ravenswood",
            "adjacent": [
              3700,
              3410,
              2514,
              3701
            ]
          },
          {
            "id": 2350,
            "name": "Sefton",
            "adjacent": [
              2350
            ]
          },
          {
            "id": 2541,
            "name": "Southbrook",
            "adjacent": [
              2541,
              2515
            ]
          },
          {
            "id": 2546,
            "name": "Springbank",
            "adjacent": [
              2546
            ]
          },
          {
            "id": 3174,
            "name": "Summerhill",
            "adjacent": [
              1517,
              1617,
              3174
            ]
          },
          {
            "id": 2548,
            "name": "Swannanoa",
            "adjacent": [
              2548
            ]
          },
          {
            "id": 3329,
            "name": "Tuahiwi",
            "adjacent": [
              2514,
              3329
            ]
          },
          {
            "id": 3426,
            "name": "View Hill",
            "adjacent": [
              3426
            ]
          },
          {
            "id": 2513,
            "name": "Waikuku",
            "adjacent": [
              2513,
              3444
            ]
          },
          {
            "id": 3444,
            "name": "Waikuku Beach",
            "adjacent": [
              2513,
              3444
            ]
          },
          {
            "id": 3216,
            "name": "West Eyreton",
            "adjacent": [
              2307,
              2313,
              3216
            ]
          },
          {
            "id": 2423,
            "name": "White Rock",
            "adjacent": [
              2423
            ]
          },
          {
            "id": 2514,
            "name": "Woodend",
            "adjacent": [
              2514,
              3329,
              3700,
              3701
            ]
          },
          {
            "id": 3633,
            "name": "Woodend Beach",
            "adjacent": [
              3633
            ]
          }
        ]
      },
      {
        "id": 66,
        "name": "Waimate",
        "suburbs": [
          {
            "id": 2169,
            "name": "Glenavy",
            "adjacent": [
              2169
            ]
          },
          {
            "id": 2479,
            "name": "Makikihi",
            "adjacent": [
              2479
            ]
          },
          {
            "id": 2291,
            "name": "Saint Andrews",
            "adjacent": [
              2291,
              3324
            ]
          },
          {
            "id": 2168,
            "name": "Waimate",
            "adjacent": [
              2168
            ]
          }
        ]
      }
    ]
  },
  {
    "id": 10,
    "name": "Otago",
    "districts": [
      {
        "id": 69,
        "name": "Central Otago",
        "suburbs": [
          {
            "id": 2296,
            "name": "Alexandra",
            "adjacent": [
              2296
            ]
          },
          {
            "id": 2297,
            "name": "Clyde",
            "adjacent": [
              2297
            ]
          },
          {
            "id": 2298,
            "name": "Cromwell",
            "adjacent": [
              2298
            ]
          },
          {
            "id": 1975,
            "name": "Ettrick",
            "adjacent": [
              3462,
              1975
            ]
          },
          {
            "id": 3381,
            "name": "Ida Valley",
            "adjacent": [
              3381
            ]
          },
          {
            "id": 3658,
            "name": "Kokonga",
            "adjacent": [
              3658
            ]
          },
          {
            "id": 3766,
            "name": "Kyeburn",
            "adjacent": [
              3766
            ]
          },
          {
            "id": 3461,
            "name": "Lauder",
            "adjacent": [
              3461
            ]
          },
          {
            "id": 3462,
            "name": "Millers Flat",
            "adjacent": [
              3462,
              1975
            ]
          },
          {
            "id": 3653,
            "name": "Moa Flat",
            "adjacent": [
              3653
            ]
          },
          {
            "id": 3738,
            "name": "Mount Pisa",
            "adjacent": [
              3738
            ]
          },
          {
            "id": 1729,
            "name": "Naseby",
            "adjacent": [
              1729
            ]
          },
          {
            "id": 1676,
            "name": "Omakau",
            "adjacent": [
              1676
            ]
          },
          {
            "id": 3448,
            "name": "Ophir",
            "adjacent": [
              3448
            ]
          },
          {
            "id": 1679,
            "name": "Oturehua",
            "adjacent": [
              1679
            ]
          },
          {
            "id": 1730,
            "name": "Ranfurly",
            "adjacent": [
              1730
            ]
          },
          {
            "id": 1976,
            "name": "Roxburgh",
            "adjacent": [
              1976
            ]
          },
          {
            "id": 3706,
            "name": "Springvale",
            "adjacent": [
              3706
            ]
          },
          {
            "id": 3502,
            "name": "St Bathans",
            "adjacent": [
              3502
            ]
          },
          {
            "id": 1675,
            "name": "Tarras",
            "adjacent": [
              1675
            ]
          },
          {
            "id": 1680,
            "name": "Wedderburn",
            "adjacent": [
              1680
            ]
          }
        ]
      },
      {
        "id": 72,
        "name": "Clutha",
        "suburbs": [
          {
            "id": 2106,
            "name": "Balclutha",
            "adjacent": [
              2106
            ]
          },
          {
            "id": 1587,
            "name": "Clinton",
            "adjacent": [
              1587
            ]
          },
          {
            "id": 3611,
            "name": "Clydevale",
            "adjacent": [
              3611
            ]
          },
          {
            "id": 3747,
            "name": "Heriot",
            "adjacent": [
              3747
            ]
          },
          {
            "id": 3882,
            "name": "Inch Clutha",
            "adjacent": [
              3882
            ]
          },
          {
            "id": 2415,
            "name": "Kaitangata",
            "adjacent": [
              2415
            ]
          },
          {
            "id": 1900,
            "name": "Kaka Point",
            "adjacent": [
              1900
            ]
          },
          {
            "id": 1632,
            "name": "Lawrence",
            "adjacent": [
              1632
            ]
          },
          {
            "id": 3724,
            "name": "Leithen Bush",
            "adjacent": [
              3724
            ]
          },
          {
            "id": 3777,
            "name": "Maclennan",
            "adjacent": [
              3777
            ]
          },
          {
            "id": 1897,
            "name": "Milton",
            "adjacent": [
              1897
            ]
          },
          {
            "id": 1489,
            "name": "Owaka",
            "adjacent": [
              1489
            ]
          },
          {
            "id": 3387,
            "name": "Pounawea",
            "adjacent": [
              3387
            ]
          },
          {
            "id": 3344,
            "name": "Taieri Mouth",
            "adjacent": [
              3344
            ]
          },
          {
            "id": 1634,
            "name": "Tapanui",
            "adjacent": [
              1634
            ]
          },
          {
            "id": 1463,
            "name": "Taumata",
            "adjacent": [
              1463
            ]
          },
          {
            "id": 3800,
            "name": "Tuapeka Flat",
            "adjacent": [
              3800
            ]
          },
          {
            "id": 1631,
            "name": "Tuapeka Mouth",
            "adjacent": [
              1631
            ]
          },
          {
            "id": 2559,
            "name": "Waihola",
            "adjacent": [
              2559
            ]
          },
          {
            "id": 3650,
            "name": "Waipahi",
            "adjacent": [
              3650
            ]
          },
          {
            "id": 1588,
            "name": "Wairuna",
            "adjacent": [
              1588
            ]
          },
          {
            "id": 3638,
            "name": "Waitahuna",
            "adjacent": [
              3638
            ]
          },
          {
            "id": 1462,
            "name": "Waiwera South",
            "adjacent": [
              1462
            ]
          }
        ]
      },
      {
        "id": 71,
        "name": "Dunedin",
        "suburbs": [
          {
            "id": 2012,
            "name": "Abbotsford",
            "adjacent": [
              1903,
              3211,
              2012,
              3838
            ]
          },
          {
            "id": 2288,
            "name": "Allanton",
            "adjacent": [
              2288
            ]
          },
          {
            "id": 3031,
            "name": "Andersons Bay",
            "adjacent": [
              1747,
              106,
              1839,
              3027,
              3028,
              3031,
              1826,
              1418
            ]
          },
          {
            "id": 1470,
            "name": "Aramoana",
            "adjacent": [
              1470
            ]
          },
          {
            "id": 1808,
            "name": "Balaclava",
            "adjacent": [
              2378,
              3038,
              3211,
              2011,
              1805,
              1806,
              1807,
              1808,
              1809,
              1810,
              3478,
              1904,
              1905,
              1906,
              3535
            ]
          },
          {
            "id": 1805,
            "name": "Belleknowes",
            "adjacent": [
              1941,
              1944,
              1945,
              1946,
              1947,
              2013,
              3038,
              1805,
              1806,
              1807,
              1808,
              1904,
              1905,
              1906,
              1907
            ]
          },
          {
            "id": 1972,
            "name": "Berwick",
            "adjacent": [
              1972
            ]
          },
          {
            "id": 1426,
            "name": "Blackhead",
            "adjacent": [
              1426,
              1903,
              2378,
              3274,
              3838
            ]
          },
          {
            "id": 1806,
            "name": "Bradford",
            "adjacent": [
              1904,
              1905,
              1906,
              1944,
              1945,
              1946,
              1947,
              2013,
              3038,
              3211,
              1805,
              1806,
              1807,
              1808,
              3578
            ]
          },
          {
            "id": 2056,
            "name": "Brighton",
            "adjacent": [
              2056,
              2068
            ]
          },
          {
            "id": 3022,
            "name": "Broad Bay",
            "adjacent": [
              1887,
              3022
            ]
          },
          {
            "id": 2013,
            "name": "Brockville",
            "adjacent": [
              1904,
              1908,
              1941,
              1945,
              1946,
              1947,
              2013,
              2014,
              3038,
              3211,
              1805,
              1806,
              3598
            ]
          },
          {
            "id": 3838,
            "name": "Burnside",
            "adjacent": [
              3838,
              2012,
              1808,
              1426,
              1810,
              2378,
              2011,
              1903,
              3211,
              1904,
              3478,
              1906,
              1905,
              1949,
              3274
            ]
          },
          {
            "id": 1810,
            "name": "Calton Hill",
            "adjacent": [
              1949,
              2378,
              3274,
              1469,
              2011,
              1807,
              1808,
              1809,
              1810,
              1832,
              3478,
              1904,
              1905,
              1906,
              1907
            ]
          },
          {
            "id": 3565,
            "name": "Careys Bay",
            "adjacent": [
              3565,
              2176,
              2209
            ]
          },
          {
            "id": 1809,
            "name": "Caversham",
            "adjacent": [
              1949,
              3039,
              1469,
              2011,
              1807,
              1808,
              1809,
              1810,
              1831,
              1832,
              3478,
              1904,
              1905,
              1906,
              1907
            ]
          },
          {
            "id": 3038,
            "name": "City Centre",
            "adjacent": [
              1944,
              1945,
              1946,
              1947,
              2013,
              3038,
              1805,
              1806,
              1807,
              1808,
              3478,
              1904,
              1905,
              1906,
              1907
            ]
          },
          {
            "id": 1807,
            "name": "Clyde Hill",
            "adjacent": [
              3038,
              3039,
              2011,
              1805,
              1806,
              1807,
              1808,
              1809,
              1810,
              1832,
              3478,
              1904,
              1905,
              1906,
              1907
            ]
          },
          {
            "id": 3023,
            "name": "Company Bay",
            "adjacent": [
              3035,
              3023,
              3024
            ]
          },
          {
            "id": 2378,
            "name": "Concord",
            "adjacent": [
              1426,
              1904,
              1949,
              2378,
              3274,
              1469,
              2011,
              1808,
              1809,
              1810,
              1832,
              3478,
              3535,
              3838
            ]
          },
          {
            "id": 2011,
            "name": "Corstorphine",
            "adjacent": [
              1949,
              2378,
              3274,
              1469,
              2011,
              1807,
              1808,
              1809,
              1810,
              1832,
              3478,
              1904,
              1905,
              1906,
              3535
            ]
          },
          {
            "id": 1988,
            "name": "Dalmore",
            "adjacent": [
              1720,
              2343,
              1987,
              1988,
              2457
            ]
          },
          {
            "id": 3057,
            "name": "East Taieri",
            "adjacent": [
              2102,
              3057,
              2103
            ]
          },
          {
            "id": 3463,
            "name": "Doctors Point",
            "adjacent": [
              2430,
              3463
            ]
          },
          {
            "id": 3713,
            "name": "Evansdale",
            "adjacent": [
              3713
            ]
          },
          {
            "id": 2070,
            "name": "Fairfield",
            "adjacent": [
              3380,
              2070
            ]
          },
          {
            "id": 3535,
            "name": "Forbury",
            "adjacent": [
              3535,
              1808,
              1810,
              1809,
              1807,
              2378,
              2011,
              1904,
              1907,
              1832,
              3478,
              1906,
              1905,
              1469,
              1949
            ]
          },
          {
            "id": 2015,
            "name": "Glenleith",
            "adjacent": [
              1908,
              1941,
              1942,
              2015,
              2016,
              2344,
              1987
            ]
          },
          {
            "id": 1947,
            "name": "Glenross",
            "adjacent": [
              1908,
              1941,
              1944,
              1945,
              1946,
              1947,
              2013,
              2014,
              3038,
              1805,
              1806
            ]
          },
          {
            "id": 1903,
            "name": "Green Island",
            "adjacent": [
              1426,
              1903,
              2012,
              3838
            ]
          },
          {
            "id": 2014,
            "name": "Halfway Bush",
            "adjacent": [
              1908,
              1941,
              1945,
              1946,
              1947,
              2013,
              2014
            ]
          },
          {
            "id": 971,
            "name": "Harington Point",
            "adjacent": [
              969,
              971
            ]
          },
          {
            "id": 1889,
            "name": "Harwood",
            "adjacent": [
              1889
            ]
          },
          {
            "id": 1908,
            "name": "Helensburgh",
            "adjacent": [
              1908,
              1941,
              1942,
              1944,
              1945,
              1946,
              1947,
              2013,
              2014,
              2015,
              2016,
              2344
            ]
          },
          {
            "id": 2528,
            "name": "Henley",
            "adjacent": [
              2528
            ]
          },
          {
            "id": 2017,
            "name": "Heyward Point",
            "adjacent": [
              2017
            ]
          },
          {
            "id": 1825,
            "name": "Highcliff",
            "adjacent": [
              3027,
              1825
            ]
          },
          {
            "id": 1877,
            "name": "Hindon",
            "adjacent": [
              1877
            ]
          },
          {
            "id": 1946,
            "name": "Kaikorai",
            "adjacent": [
              1904,
              1905,
              1906,
              1908,
              1941,
              1944,
              1945,
              1946,
              1947,
              2013,
              2014,
              3038,
              1805,
              1806
            ]
          },
          {
            "id": 3211,
            "name": "Kaikorai Valley",
            "adjacent": [
              1904,
              2013,
              3211,
              2012,
              1806,
              1808,
              3598,
              3838
            ]
          },
          {
            "id": 459,
            "name": "Karitane",
            "adjacent": [
              459
            ]
          },
          {
            "id": 1904,
            "name": "Kenmure",
            "adjacent": [
              1946,
              3038,
              3211,
              2011,
              1805,
              1806,
              1807,
              1808,
              1809,
              1810,
              3478,
              1904,
              1905,
              1906,
              1907
            ]
          },
          {
            "id": 1907,
            "name": "Kensington",
            "adjacent": [
              1839,
              3038,
              3039,
              1469,
              1807,
              1809,
              1810,
              1831,
              1832,
              3478,
              1904,
              1905,
              1906,
              1907,
              3535
            ]
          },
          {
            "id": 1832,
            "name": "Kew",
            "adjacent": [
              1949,
              2378,
              3039,
              3274,
              1469,
              2011,
              1807,
              1809,
              1810,
              1831,
              1832,
              3478,
              1906,
              1907,
              3535
            ]
          },
          {
            "id": 2102,
            "name": "Kinmont Park",
            "adjacent": [
              2102,
              2103,
              3057,
              3380
            ]
          },
          {
            "id": 2016,
            "name": "Leith Valley",
            "adjacent": [
              1908,
              1942,
              2015,
              2016,
              2344,
              2429,
              1987
            ]
          },
          {
            "id": 1987,
            "name": "Liberton",
            "adjacent": [
              1942,
              2015,
              2016,
              2344,
              2429,
              3037,
              1987,
              1988,
              1989,
              2457
            ]
          },
          {
            "id": 1944,
            "name": "Littlebourne",
            "adjacent": [
              1908,
              1941,
              1942,
              1944,
              1945,
              1946,
              1947,
              2344,
              3037,
              3038,
              1805,
              1806
            ]
          },
          {
            "id": 3362,
            "name": "Long Beach",
            "adjacent": [
              3362,
              3363,
              1490
            ]
          },
          {
            "id": 3478,
            "name": "Lookout Point",
            "adjacent": [
              1949,
              3038,
              3039,
              1469,
              2011,
              1807,
              1808,
              1809,
              1810,
              1832,
              3478,
              1904,
              1905,
              1906,
              1907
            ]
          },
          {
            "id": 3024,
            "name": "Macandrew Bay",
            "adjacent": [
              3023,
              3024
            ]
          },
          {
            "id": 3464,
            "name": "Maia",
            "adjacent": [
              3032,
              3035,
              3464
            ]
          },
          {
            "id": 1942,
            "name": "Maori Hill",
            "adjacent": [
              1908,
              1941,
              1942,
              1944,
              1945,
              2015,
              2016,
              2344,
              2429,
              3037,
              1987,
              1989
            ]
          },
          {
            "id": 1906,
            "name": "Maryhill",
            "adjacent": [
              3038,
              3039,
              2011,
              1805,
              1806,
              1807,
              1808,
              1809,
              1810,
              1832,
              3478,
              1904,
              1905,
              1906,
              1907
            ]
          },
          {
            "id": 1582,
            "name": "Maungatua",
            "adjacent": [
              1582
            ]
          },
          {
            "id": 1844,
            "name": "Middlemarch",
            "adjacent": [
              1844
            ]
          },
          {
            "id": 3622,
            "name": "Momona",
            "adjacent": [
              3622,
              2433
            ]
          },
          {
            "id": 1905,
            "name": "Mornington",
            "adjacent": [
              3038,
              3039,
              2011,
              1805,
              1806,
              1807,
              1808,
              1809,
              1810,
              3478,
              1904,
              1905,
              1906,
              1907,
              3535
            ]
          },
          {
            "id": 2103,
            "name": "Mosgiel",
            "adjacent": [
              2102,
              2103,
              3057
            ]
          },
          {
            "id": 3598,
            "name": "Mount Grand",
            "adjacent": [
              3598,
              1806,
              2013,
              3211
            ]
          },
          {
            "id": 1720,
            "name": "Mount Mera",
            "adjacent": [
              1720,
              2343,
              2429,
              3032,
              1988,
              1989,
              2457
            ]
          },
          {
            "id": 3386,
            "name": "Mt Cargill",
            "adjacent": [
              3386
            ]
          },
          {
            "id": 1839,
            "name": "Musselburgh",
            "adjacent": [
              1747,
              106,
              1839,
              1907,
              3028,
              3031,
              3039,
              1826,
              1831,
              1418
            ]
          },
          {
            "id": 2343,
            "name": "Normanby",
            "adjacent": [
              1720,
              2343,
              1988,
              1989,
              2457,
              2429
            ]
          },
          {
            "id": 3037,
            "name": "North Dunedin",
            "adjacent": [
              1942,
              1944,
              1945,
              2344,
              2429,
              3037,
              1987,
              1989
            ]
          },
          {
            "id": 2429,
            "name": "North East Valley",
            "adjacent": [
              1720,
              1942,
              2016,
              2344,
              2429,
              3037,
              1987,
              1989,
              2343
            ]
          },
          {
            "id": 2104,
            "name": "North Taieri",
            "adjacent": [
              2104
            ]
          },
          {
            "id": 1826,
            "name": "Ocean Grove",
            "adjacent": [
              1747,
              1839,
              3028,
              3031,
              1826
            ]
          },
          {
            "id": 2068,
            "name": "Ocean View",
            "adjacent": [
              2056,
              2068
            ]
          },
          {
            "id": 1989,
            "name": "Opoho",
            "adjacent": [
              1720,
              1942,
              2343,
              2344,
              2429,
              3032,
              3037,
              1987,
              1989
            ]
          },
          {
            "id": 3363,
            "name": "Osborne",
            "adjacent": [
              3362,
              3363,
              1490
            ]
          },
          {
            "id": 3192,
            "name": "Otago Peninsula",
            "adjacent": [
              3192
            ]
          },
          {
            "id": 969,
            "name": "Otakou",
            "adjacent": [
              969,
              971
            ]
          },
          {
            "id": 2433,
            "name": "Otokia",
            "adjacent": [
              2433,
              3622
            ]
          },
          {
            "id": 1585,
            "name": "Outram",
            "adjacent": [
              1585
            ]
          },
          {
            "id": 2457,
            "name": "Pine Hill",
            "adjacent": [
              1720,
              2343,
              1987,
              1988,
              2457
            ]
          },
          {
            "id": 2176,
            "name": "Port Chalmers",
            "adjacent": [
              2209,
              3036,
              2176,
              3565
            ]
          },
          {
            "id": 1887,
            "name": "Portobello",
            "adjacent": [
              1887,
              3022
            ]
          },
          {
            "id": 1490,
            "name": "Purakaunui",
            "adjacent": [
              3362,
              3363,
              1490
            ]
          },
          {
            "id": 3032,
            "name": "Ravensbourne",
            "adjacent": [
              1720,
              3027,
              3032,
              3464,
              1989
            ]
          },
          {
            "id": 3036,
            "name": "Roseneath",
            "adjacent": [
              2209,
              3036,
              2176
            ]
          },
          {
            "id": 1945,
            "name": "Roslyn",
            "adjacent": [
              1908,
              1941,
              1942,
              1944,
              1945,
              1946,
              1947,
              2013,
              2014,
              2344,
              3037,
              3038,
              1805,
              1806
            ]
          },
          {
            "id": 3380,
            "name": "Saddle Hill",
            "adjacent": [
              2102,
              3380,
              2070
            ]
          },
          {
            "id": 1469,
            "name": "Saint Clair",
            "adjacent": [
              1907,
              1949,
              2378,
              3039,
              3274,
              1469,
              2011,
              1807,
              1809,
              1810,
              1831,
              1832,
              3478,
              3535,
              3578
            ]
          },
          {
            "id": 1949,
            "name": "Saint Clair Park",
            "adjacent": [
              1949,
              2378,
              3274,
              1469,
              2011,
              1809,
              1810,
              1831,
              1832,
              3478,
              3535,
              3838
            ]
          },
          {
            "id": 1831,
            "name": "Saint Kilda",
            "adjacent": [
              1839,
              1907,
              1949,
              3039,
              1469,
              1807,
              1809,
              1831,
              1832,
              3478,
              1418,
              3535,
              3578
            ]
          },
          {
            "id": 3035,
            "name": "Saint Leonards",
            "adjacent": [
              3035,
              3464,
              3023
            ]
          },
          {
            "id": 2209,
            "name": "Sawyers Bay",
            "adjacent": [
              2209,
              3036,
              2176,
              3565
            ]
          },
          {
            "id": 2289,
            "name": "Scroggs Hill",
            "adjacent": [
              2289
            ]
          },
          {
            "id": 1747,
            "name": "Shiel Hill",
            "adjacent": [
              1747,
              106,
              1839,
              3027,
              3028,
              3031,
              1826,
              1418
            ]
          },
          {
            "id": 3039,
            "name": "South Dunedin",
            "adjacent": [
              1839,
              1905,
              1906,
              1907,
              3038,
              3039,
              1469,
              2011,
              1807,
              1809,
              1810,
              1831,
              1832,
              3478,
              1418
            ]
          },
          {
            "id": 1418,
            "name": "Tainui",
            "adjacent": [
              1747,
              106,
              1839,
              1907,
              3028,
              3031,
              3039,
              1831,
              1418
            ]
          },
          {
            "id": 3027,
            "name": "The Cove",
            "adjacent": [
              1747,
              106,
              3027,
              3028,
              3031,
              3032,
              1825
            ]
          },
          {
            "id": 3578,
            "name": "The Glen",
            "adjacent": [
              3578,
              1808,
              1805,
              1806,
              1810,
              1809,
              3038,
              1807,
              2011,
              3535,
              1904,
              1907,
              1832,
              3478,
              1906
            ]
          },
          {
            "id": 3809,
            "name": "Upper Waitati",
            "adjacent": [
              3809
            ]
          },
          {
            "id": 106,
            "name": "Vauxhall",
            "adjacent": [
              1747,
              106,
              1839,
              3027,
              3028,
              3031,
              1418
            ]
          },
          {
            "id": 2432,
            "name": "Waikouaiti",
            "adjacent": [
              2432
            ]
          },
          {
            "id": 1973,
            "name": "Waipori",
            "adjacent": [
              1973
            ]
          },
          {
            "id": 2430,
            "name": "Waitati",
            "adjacent": [
              2430,
              3463
            ]
          },
          {
            "id": 1941,
            "name": "Wakari",
            "adjacent": [
              1908,
              1941,
              1942,
              1944,
              1945,
              1946,
              1947,
              2013,
              2014,
              2015,
              2344,
              1805
            ]
          },
          {
            "id": 1427,
            "name": "Waldronville",
            "adjacent": [
              1427
            ]
          },
          {
            "id": 458,
            "name": "Warrington",
            "adjacent": [
              458
            ]
          },
          {
            "id": 3028,
            "name": "Waverley",
            "adjacent": [
              1747,
              106,
              1839,
              3027,
              3028,
              3031,
              1826,
              1418
            ]
          },
          {
            "id": 3274,
            "name": "Westgate",
            "adjacent": [
              1426,
              1949,
              2378,
              3274,
              1469,
              2011,
              1808,
              1809,
              1810,
              1832,
              3478,
              3535,
              3838
            ]
          },
          {
            "id": 2069,
            "name": "Westwood",
            "adjacent": [
              2069
            ]
          },
          {
            "id": 2071,
            "name": "Wingatui",
            "adjacent": [
              2071
            ]
          },
          {
            "id": 2344,
            "name": "Woodhaugh",
            "adjacent": [
              1908,
              1941,
              1942,
              1944,
              1945,
              2015,
              2016,
              2344,
              2429,
              3037,
              1987,
              1989
            ]
          }
        ]
      },
      {
        "id": 70,
        "name": "Queenstown-Lakes",
        "suburbs": [
          {
            "id": 2330,
            "name": "Arrow Junction",
            "adjacent": [
              2330,
              2327
            ]
          },
          {
            "id": 2329,
            "name": "Arrowtown",
            "adjacent": [
              2329,
              2327
            ]
          },
          {
            "id": 1746,
            "name": "Arthurs Point",
            "adjacent": [
              1746
            ]
          },
          {
            "id": 3585,
            "name": "Ben Lomond",
            "adjacent": [
              3585,
              1848,
              955
            ]
          },
          {
            "id": 1849,
            "name": "Boydtown",
            "adjacent": [
              955,
              1674,
              1849,
              3145
            ]
          },
          {
            "id": 3149,
            "name": "Closeburn",
            "adjacent": [
              3149,
              2141
            ]
          },
          {
            "id": 2328,
            "name": "Crown Terrace",
            "adjacent": [
              2328,
              2327
            ]
          },
          {
            "id": 3150,
            "name": "Dalefield",
            "adjacent": [
              3150,
              3754
            ]
          },
          {
            "id": 3875,
            "name": "Drift Bay",
            "adjacent": [
              3875
            ]
          },
          {
            "id": 1848,
            "name": "Fernhill",
            "adjacent": [
              955,
              1848,
              3585
            ]
          },
          {
            "id": 953,
            "name": "Frankton",
            "adjacent": [
              953,
              3151
            ]
          },
          {
            "id": 1508,
            "name": "Gibbston",
            "adjacent": [
              1508,
              2327
            ]
          },
          {
            "id": 2301,
            "name": "Glenorchy",
            "adjacent": [
              2301
            ]
          },
          {
            "id": 3151,
            "name": "Goldfield Heights",
            "adjacent": [
              952,
              953,
              1674,
              3145,
              3151
            ]
          },
          {
            "id": 3276,
            "name": "Jacks Point",
            "adjacent": [
              3276
            ]
          },
          {
            "id": 3827,
            "name": "Kawarau Falls",
            "adjacent": [
              3827
            ]
          },
          {
            "id": 3795,
            "name": "Kelvin Heights",
            "adjacent": [
              3795,
              952,
              1674
            ]
          },
          {
            "id": 952,
            "name": "Kelvin Peninsula",
            "adjacent": [
              952,
              1674,
              3151,
              3795
            ]
          },
          {
            "id": 1510,
            "name": "Kingston",
            "adjacent": [
              1510
            ]
          },
          {
            "id": 3090,
            "name": "Lake Hayes",
            "adjacent": [
              1505,
              3090
            ]
          },
          {
            "id": 3843,
            "name": "Lake Hayes Estate",
            "adjacent": [
              3843
            ]
          },
          {
            "id": 2141,
            "name": "Lake Wakatipu",
            "adjacent": [
              3149,
              2141
            ]
          },
          {
            "id": 1505,
            "name": "Lower Shotover",
            "adjacent": [
              1505,
              3090
            ]
          },
          {
            "id": 3665,
            "name": "Mount Creighton",
            "adjacent": [
              3665
            ]
          },
          {
            "id": 1674,
            "name": "Queenstown East",
            "adjacent": [
              952,
              1674,
              1849,
              3145,
              3151,
              3795
            ]
          },
          {
            "id": 3145,
            "name": "Queenstown Hill",
            "adjacent": [
              1674,
              1849,
              3145,
              3151
            ]
          },
          {
            "id": 3754,
            "name": "Speargrass Flat",
            "adjacent": [
              3754,
              3150
            ]
          },
          {
            "id": 1847,
            "name": "Sunshine Bay",
            "adjacent": [
              1745,
              1428,
              1763,
              1847,
              2116,
              2117,
              3331
            ]
          },
          {
            "id": 955,
            "name": "Town Centre",
            "adjacent": [
              955,
              1848,
              1849,
              3585
            ]
          }
        ]
      },
      {
        "id": 79,
        "name": "South Otago",
        "suburbs": [
          {
            "id": 3354,
            "name": "Stirling",
            "adjacent": [
              3354
            ]
          }
        ]
      },
      {
        "id": 68,
        "name": "Waitaki",
        "suburbs": [
          {
            "id": 3402,
            "name": "Alma",
            "adjacent": [
              3402
            ]
          },
          {
            "id": 3091,
            "name": "Lake Ohau",
            "adjacent": [
              3091
            ]
          },
          {
            "id": 1931,
            "name": "Awamoko",
            "adjacent": [
              1931
            ]
          },
          {
            "id": 1734,
            "name": "Dunback",
            "adjacent": [
              1734
            ]
          },
          {
            "id": 2862,
            "name": "Duntroon",
            "adjacent": [
              2862
            ]
          },
          {
            "id": 1754,
            "name": "Enfield",
            "adjacent": [
              1754
            ]
          },
          {
            "id": 3442,
            "name": "Glenavy",
            "adjacent": [
              3442
            ]
          },
          {
            "id": 2554,
            "name": "Hampden",
            "adjacent": [
              2554
            ]
          },
          {
            "id": 2556,
            "name": "Herbert",
            "adjacent": [
              2556
            ]
          },
          {
            "id": 47,
            "name": "Kakanui",
            "adjacent": [
              47,
              2366
            ]
          },
          {
            "id": 2167,
            "name": "Kurow",
            "adjacent": [
              2167
            ]
          },
          {
            "id": 2368,
            "name": "Maheno",
            "adjacent": [
              2368
            ]
          },
          {
            "id": 2553,
            "name": "Moeraki",
            "adjacent": [
              2553
            ]
          },
          {
            "id": 1688,
            "name": "Ngapara",
            "adjacent": [
              1688
            ]
          },
          {
            "id": 2372,
            "name": "Oamaru",
            "adjacent": [
              2371,
              2372
            ]
          },
          {
            "id": 3059,
            "name": "Otematata",
            "adjacent": [
              3059
            ]
          },
          {
            "id": 2519,
            "name": "Palmerston",
            "adjacent": [
              2519
            ]
          },
          {
            "id": 2038,
            "name": "Pukeuri",
            "adjacent": [
              2038
            ]
          },
          {
            "id": 2036,
            "name": "Sailors Cutting",
            "adjacent": [
              2036
            ]
          },
          {
            "id": 2371,
            "name": "South Oamaru",
            "adjacent": [
              2371,
              2372
            ]
          },
          {
            "id": 2366,
            "name": "Taranui",
            "adjacent": [
              47,
              2366
            ]
          },
          {
            "id": 3401,
            "name": "Totara",
            "adjacent": [
              3401
            ]
          },
          {
            "id": 2373,
            "name": "Waiareka",
            "adjacent": [
              1727,
              2373
            ]
          },
          {
            "id": 3465,
            "name": "Waihemo",
            "adjacent": [
              3465
            ]
          },
          {
            "id": 1727,
            "name": "Weston",
            "adjacent": [
              1727,
              2373
            ]
          },
          {
            "id": 3400,
            "name": "Windsor",
            "adjacent": [
              3400
            ]
          },
          {
            "id": 3097,
            "name": "Omarama",
            "adjacent": [
              3097
            ]
          }
        ]
      },
      {
        "id": 83,
        "name": "Wanaka",
        "suburbs": [
          {
            "id": 3193,
            "name": "Albert Town",
            "adjacent": [
              2303,
              3093,
              3193,
              3519,
              3523
            ]
          },
          {
            "id": 2327,
            "name": "Cardrona",
            "adjacent": [
              1508,
              2327,
              2328,
              2329,
              2330
            ]
          },
          {
            "id": 3526,
            "name": "Cattle flat",
            "adjacent": [
              2100,
              2303,
              3520,
              3524,
              3526
            ]
          },
          {
            "id": 3524,
            "name": "Glendhu Bay",
            "adjacent": [
              2303,
              3193,
              3520,
              3524,
              3526
            ]
          },
          {
            "id": 3519,
            "name": "Hawea Flat",
            "adjacent": [
              2100,
              3093,
              3193,
              3519,
              3523
            ]
          },
          {
            "id": 3521,
            "name": "Hunter Valley",
            "adjacent": [
              2100,
              3521,
              3525
            ]
          },
          {
            "id": 2100,
            "name": "Lake Hawea",
            "adjacent": [
              2100,
              3519,
              3521,
              3525,
              3526
            ]
          },
          {
            "id": 3493,
            "name": "Queensberry",
            "adjacent": [
              3493,
              3093
            ]
          },
          {
            "id": 1725,
            "name": "Makarora",
            "adjacent": [
              1725
            ]
          },
          {
            "id": 3522,
            "name": "Mount Aspiring",
            "adjacent": [
              3520,
              3522
            ]
          },
          {
            "id": 3523,
            "name": "Mount Barker",
            "adjacent": [
              2303,
              3093,
              3193,
              3519,
              3523
            ]
          },
          {
            "id": 3525,
            "name": "The Neck",
            "adjacent": [
              2100,
              3521,
              3525,
              3526
            ]
          },
          {
            "id": 3520,
            "name": "Treble cone",
            "adjacent": [
              2303,
              3520,
              3522,
              3524,
              3526
            ]
          },
          {
            "id": 2303,
            "name": "Wanaka",
            "adjacent": [
              2303,
              3093,
              3193,
              3523,
              3524
            ]
          },
          {
            "id": 3093,
            "name": "Luggate",
            "adjacent": [
              3093,
              3193,
              3493,
              3519,
              3523
            ]
          }
        ]
      }
    ]
  },
  {
    "id": 11,
    "name": "Southland",
    "districts": [
      {
        "id": 78,
        "name": "Catlins",
        "suburbs": [
          {
            "id": 3741,
            "name": "Curio Bay",
            "adjacent": [
              3741
            ]
          },
          {
            "id": 3645,
            "name": "Progress Valley",
            "adjacent": [
              3645
            ]
          },
          {
            "id": 3742,
            "name": "Tokanui",
            "adjacent": [
              3742,
              2438
            ]
          },
          {
            "id": 3237,
            "name": "Waikawa Valley",
            "adjacent": [
              3237
            ]
          }
        ]
      },
      {
        "id": 74,
        "name": "Gore",
        "suburbs": [
          {
            "id": 3651,
            "name": "Conical Hill",
            "adjacent": [
              3651
            ]
          },
          {
            "id": 1985,
            "name": "Gore",
            "adjacent": [
              1985
            ]
          },
          {
            "id": 2023,
            "name": "Mataura",
            "adjacent": [
              2023
            ]
          },
          {
            "id": 3711,
            "name": "Te Tipua",
            "adjacent": [
              3711
            ]
          },
          {
            "id": 3637,
            "name": "Waimumu",
            "adjacent": [
              3637
            ]
          }
        ]
      },
      {
        "id": 75,
        "name": "Invercargill",
        "suburbs": [
          {
            "id": 3064,
            "name": "Appleby",
            "adjacent": [
              2537,
              3064,
              3076,
              3082,
              3137,
              3153,
              3373,
              2052,
              2080,
              3609
            ]
          },
          {
            "id": 3467,
            "name": "Ascot",
            "adjacent": [
              2533,
              3081,
              3136,
              3138,
              3154,
              3467,
              3468,
              3475
            ]
          },
          {
            "id": 3065,
            "name": "Avenal",
            "adjacent": [
              2532,
              2534,
              3065,
              3136,
              3153,
              3154,
              3373,
              2052,
              3748
            ]
          },
          {
            "id": 2450,
            "name": "Bluff",
            "adjacent": [
              2450
            ]
          },
          {
            "id": 2052,
            "name": "City Centre",
            "adjacent": [
              2532,
              3064,
              3065,
              3076,
              3153,
              3154,
              3373,
              2052,
              3609
            ]
          },
          {
            "id": 2536,
            "name": "Clifton",
            "adjacent": [
              2536,
              3088
            ]
          },
          {
            "id": 3076,
            "name": "Georgetown",
            "adjacent": [
              2537,
              3064,
              3076,
              3081,
              3082,
              3137,
              3153,
              3154,
              3373,
              2052,
              2080,
              3609,
              3727
            ]
          },
          {
            "id": 2532,
            "name": "Gladstone",
            "adjacent": [
              2532,
              2533,
              2534,
              3065,
              3136,
              3138,
              3154,
              3468,
              2052,
              3475,
              3748
            ]
          },
          {
            "id": 2533,
            "name": "Glengarry",
            "adjacent": [
              2532,
              2533,
              2537,
              3081,
              3136,
              3138,
              3153,
              3154,
              3467,
              3468,
              3475,
              3609
            ]
          },
          {
            "id": 3078,
            "name": "Grasmere",
            "adjacent": [
              3078,
              3372,
              3748
            ]
          },
          {
            "id": 3678,
            "name": "Greenhills",
            "adjacent": [
              3678
            ]
          },
          {
            "id": 3468,
            "name": "Hargest",
            "adjacent": [
              2532,
              2533,
              3081,
              3136,
              3138,
              3154,
              3467,
              3468,
              3475
            ]
          },
          {
            "id": 3081,
            "name": "Hawthorndale",
            "adjacent": [
              2533,
              2537,
              3076,
              3081,
              3138,
              3153,
              3154,
              3467,
              3468,
              3475,
              3609,
              3727
            ]
          },
          {
            "id": 3082,
            "name": "Heidelberg",
            "adjacent": [
              2537,
              3064,
              3076,
              3082,
              3088,
              3137,
              2080,
              3609,
              3727
            ]
          },
          {
            "id": 3373,
            "name": "Invercargill",
            "adjacent": [
              3064,
              3065,
              3076,
              3137,
              3153,
              3154,
              3373,
              2052,
              3609
            ]
          },
          {
            "id": 2140,
            "name": "Kennington",
            "adjacent": [
              2140
            ]
          },
          {
            "id": 2080,
            "name": "Kew",
            "adjacent": [
              3064,
              3076,
              3082,
              3088,
              3137,
              2080
            ]
          },
          {
            "id": 3088,
            "name": "Kingswell",
            "adjacent": [
              2536,
              3082,
              3088,
              3137,
              2080
            ]
          },
          {
            "id": 3654,
            "name": "Longbush",
            "adjacent": [
              3654,
              2114
            ]
          },
          {
            "id": 3340,
            "name": "Lorneville",
            "adjacent": [
              3340,
              1479
            ]
          },
          {
            "id": 3416,
            "name": "Mabel Bush",
            "adjacent": [
              3416
            ]
          },
          {
            "id": 1479,
            "name": "Makarewa",
            "adjacent": [
              3340,
              1479
            ]
          },
          {
            "id": 2413,
            "name": "Mataura Island",
            "adjacent": [
              2413
            ]
          },
          {
            "id": 3779,
            "name": "Mokotua",
            "adjacent": [
              3779
            ]
          },
          {
            "id": 3152,
            "name": "Myross Bush",
            "adjacent": [
              3152
            ]
          },
          {
            "id": 3793,
            "name": "New River Ferry",
            "adjacent": [
              3793
            ]
          },
          {
            "id": 2537,
            "name": "Newfield",
            "adjacent": [
              2533,
              2537,
              3064,
              3076,
              3081,
              3082,
              3137,
              3153,
              3609,
              3727
            ]
          },
          {
            "id": 3647,
            "name": "Omaui",
            "adjacent": [
              3647
            ]
          },
          {
            "id": 3739,
            "name": "Otahuti",
            "adjacent": [
              3739
            ]
          },
          {
            "id": 1480,
            "name": "Otatara",
            "adjacent": [
              1480
            ]
          },
          {
            "id": 3748,
            "name": "Prestonville",
            "adjacent": [
              3748,
              3065,
              2532,
              3078,
              3136,
              2534
            ]
          },
          {
            "id": 3153,
            "name": "Richmond",
            "adjacent": [
              2533,
              2537,
              3064,
              3065,
              3076,
              3081,
              3137,
              3138,
              3153,
              3154,
              3373,
              2052,
              3475,
              3609
            ]
          },
          {
            "id": 3727,
            "name": "Rockdale",
            "adjacent": [
              3727,
              3076,
              3081,
              3082,
              2537,
              3652,
              3609
            ]
          },
          {
            "id": 3136,
            "name": "Rosedale",
            "adjacent": [
              2532,
              2533,
              2534,
              3065,
              3136,
              3138,
              3154,
              3467,
              3468,
              3475,
              3748
            ]
          },
          {
            "id": 3238,
            "name": "Roslyn Bush",
            "adjacent": [
              3238
            ]
          },
          {
            "id": 3780,
            "name": "Ryal Bush",
            "adjacent": [
              3780,
              1484
            ]
          },
          {
            "id": 3652,
            "name": "Seaward Bush",
            "adjacent": [
              3652,
              3727
            ]
          },
          {
            "id": 3137,
            "name": "Strathern",
            "adjacent": [
              2537,
              3064,
              3076,
              3082,
              3088,
              3137,
              3153,
              3373,
              2080,
              3609
            ]
          },
          {
            "id": 2535,
            "name": "Tisbury",
            "adjacent": [
              2452,
              2535
            ]
          },
          {
            "id": 3609,
            "name": "Turnbull Thomson Park",
            "adjacent": [
              3609,
              3081,
              2052,
              2533,
              3373,
              3076,
              2537,
              3064,
              3153,
              3137,
              3475,
              3154,
              3082,
              3727
            ]
          },
          {
            "id": 3539,
            "name": "Tussock Creek",
            "adjacent": [
              3539
            ]
          },
          {
            "id": 2534,
            "name": "Waikiwi",
            "adjacent": [
              2532,
              2534,
              3065,
              3136,
              3748
            ]
          },
          {
            "id": 3474,
            "name": "Wallacetown",
            "adjacent": [
              1478,
              3474
            ]
          },
          {
            "id": 3475,
            "name": "Waverley",
            "adjacent": [
              2532,
              2533,
              3081,
              3136,
              3138,
              3153,
              3154,
              3467,
              3468,
              3475,
              3609
            ]
          },
          {
            "id": 3372,
            "name": "West Plains",
            "adjacent": [
              3078,
              3372
            ]
          },
          {
            "id": 3154,
            "name": "Windsor",
            "adjacent": [
              2532,
              2533,
              3065,
              3076,
              3081,
              3136,
              3138,
              3153,
              3154,
              3373,
              3467,
              3468,
              2052,
              3475,
              3609
            ]
          },
          {
            "id": 2452,
            "name": "Woodend",
            "adjacent": [
              2452,
              2535
            ]
          }
        ]
      },
      {
        "id": 73,
        "name": "Southland",
        "suburbs": [
          {
            "id": 3672,
            "name": "Ashers",
            "adjacent": [
              3672
            ]
          },
          {
            "id": 2081,
            "name": "Athol",
            "adjacent": [
              2081
            ]
          },
          {
            "id": 3369,
            "name": "Balfour",
            "adjacent": [
              3369
            ]
          },
          {
            "id": 3776,
            "name": "Branxholme",
            "adjacent": [
              3776
            ]
          },
          {
            "id": 2445,
            "name": "Browns",
            "adjacent": [
              2445
            ]
          },
          {
            "id": 3887,
            "name": "Cattle Flat",
            "adjacent": [
              3887
            ]
          },
          {
            "id": 3342,
            "name": "Centre Bush",
            "adjacent": [
              2446,
              3342
            ]
          },
          {
            "id": 3069,
            "name": "Colac Bay",
            "adjacent": [
              3069
            ]
          },
          {
            "id": 3641,
            "name": "Dacre",
            "adjacent": [
              3641
            ]
          },
          {
            "id": 3383,
            "name": "Dipton",
            "adjacent": [
              3383
            ]
          },
          {
            "id": 2421,
            "name": "Dipton West",
            "adjacent": [
              2421
            ]
          },
          {
            "id": 2420,
            "name": "Drummond",
            "adjacent": [
              2420
            ]
          },
          {
            "id": 3801,
            "name": "Eastern Bush",
            "adjacent": [
              3801
            ]
          },
          {
            "id": 2428,
            "name": "Edendale",
            "adjacent": [
              2428
            ]
          },
          {
            "id": 3746,
            "name": "Feldwick",
            "adjacent": [
              3746
            ]
          },
          {
            "id": 3616,
            "name": "Fortrose",
            "adjacent": [
              3616
            ]
          },
          {
            "id": 3417,
            "name": "Garston",
            "adjacent": [
              3417
            ]
          },
          {
            "id": 3841,
            "name": "Grove Bush",
            "adjacent": [
              3841
            ]
          },
          {
            "id": 3635,
            "name": "Heddon Bush",
            "adjacent": [
              3635
            ]
          },
          {
            "id": 3642,
            "name": "Hedgehope",
            "adjacent": [
              3642
            ]
          },
          {
            "id": 3341,
            "name": "Isla Bank",
            "adjacent": [
              3341
            ]
          },
          {
            "id": 2446,
            "name": "Limehills",
            "adjacent": [
              2446,
              3342
            ]
          },
          {
            "id": 2447,
            "name": "Lumsden",
            "adjacent": [
              2447
            ]
          },
          {
            "id": 2540,
            "name": "Manapouri",
            "adjacent": [
              2540
            ]
          },
          {
            "id": 2440,
            "name": "Mossburn",
            "adjacent": [
              2440
            ]
          },
          {
            "id": 1473,
            "name": "Nightcaps",
            "adjacent": [
              1473
            ]
          },
          {
            "id": 2084,
            "name": "Oban",
            "adjacent": [
              2084
            ]
          },
          {
            "id": 1472,
            "name": "Ohai",
            "adjacent": [
              1472
            ]
          },
          {
            "id": 1476,
            "name": "Orepuki",
            "adjacent": [
              1476
            ]
          },
          {
            "id": 3765,
            "name": "Otama",
            "adjacent": [
              3765
            ]
          },
          {
            "id": 3643,
            "name": "Otapiri",
            "adjacent": [
              3643
            ]
          },
          {
            "id": 1474,
            "name": "Otautau",
            "adjacent": [
              1474
            ]
          },
          {
            "id": 3644,
            "name": "Pine Bush",
            "adjacent": [
              3644
            ]
          },
          {
            "id": 3840,
            "name": "Rakahouka",
            "adjacent": [
              3840
            ]
          },
          {
            "id": 3877,
            "name": "Rimu",
            "adjacent": [
              3877
            ]
          },
          {
            "id": 2448,
            "name": "Riversdale",
            "adjacent": [
              2448
            ]
          },
          {
            "id": 1477,
            "name": "Riverton",
            "adjacent": [
              1477
            ]
          },
          {
            "id": 1484,
            "name": "Ryal Bush",
            "adjacent": [
              1484,
              3780
            ]
          },
          {
            "id": 3636,
            "name": "South Hillend",
            "adjacent": [
              3636
            ]
          },
          {
            "id": 2028,
            "name": "Stewart Island",
            "adjacent": [
              2028
            ]
          },
          {
            "id": 2539,
            "name": "Te Anau",
            "adjacent": [
              2539
            ]
          },
          {
            "id": 3714,
            "name": "Te Tipua",
            "adjacent": [
              3714
            ]
          },
          {
            "id": 1482,
            "name": "Thornbury",
            "adjacent": [
              1482
            ]
          },
          {
            "id": 2438,
            "name": "Tokanui",
            "adjacent": [
              2438,
              3742
            ]
          },
          {
            "id": 1475,
            "name": "Tuatapere",
            "adjacent": [
              1475
            ]
          },
          {
            "id": 3466,
            "name": "Waianiwa",
            "adjacent": [
              3466
            ]
          },
          {
            "id": 2449,
            "name": "Waikaia",
            "adjacent": [
              2449
            ]
          },
          {
            "id": 3760,
            "name": "Waikouro",
            "adjacent": [
              3760
            ]
          },
          {
            "id": 3630,
            "name": "Waimahaka",
            "adjacent": [
              3630
            ]
          },
          {
            "id": 3659,
            "name": "Waimatuku",
            "adjacent": [
              3659
            ]
          },
          {
            "id": 2426,
            "name": "Waituna",
            "adjacent": [
              2426
            ]
          },
          {
            "id": 1478,
            "name": "Wallacetown",
            "adjacent": [
              1478,
              3474
            ]
          },
          {
            "id": 3138,
            "name": "Waverley",
            "adjacent": [
              2532,
              2533,
              3081,
              3136,
              3138,
              3153,
              3154,
              3467,
              3468,
              3475
            ]
          },
          {
            "id": 1485,
            "name": "Winton",
            "adjacent": [
              1485
            ]
          },
          {
            "id": 2114,
            "name": "Woodlands",
            "adjacent": [
              2114,
              3654
            ]
          },
          {
            "id": 3752,
            "name": "Woodlaw",
            "adjacent": [
              3752
            ]
          },
          {
            "id": 2112,
            "name": "Wyndham",
            "adjacent": [
              2112
            ]
          }
        ]
      }
    ]
  }
];
