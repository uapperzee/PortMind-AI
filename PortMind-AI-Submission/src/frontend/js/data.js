/**
 * PortMind AI — Data Layer
 * All sample data embedded as JS constants so the app works on file:// protocol.
 * JSON files in /data/ serve as the backend-ready data contracts.
 */

// ─── VESSELS ──────────────────────────────────────────────────────────────────
const VESSELS_DATA = [
  { id:"V-101", name:"MSC Aurora", flag:"Panama", type:"Container", eta:"2026-07-15T06:00:00", etd:"2026-07-15T18:00:00", cargo:"General", containers:1240, assignedBerth:"B-01", waitingTime:0.5, riskScore:18, status:"On Time", riskFactors:[], route:"Rotterdam → Antwerp → Hamburg", priority:"Normal", grossTonnage:85000, length:300 },
  { id:"V-102", name:"CMA Belfort", flag:"France", type:"Container", eta:"2026-07-15T07:30:00", etd:"2026-07-15T19:30:00", cargo:"Refrigerated", containers:980, assignedBerth:"B-02", waitingTime:0.8, riskScore:24, status:"On Time", riskFactors:[], route:"Singapore → Colombo → Jeddah → Hamburg", priority:"Normal", grossTonnage:72000, length:275 },
  { id:"V-103", name:"Evergreen Horizon", flag:"Taiwan", type:"Container", eta:"2026-07-15T08:00:00", etd:"2026-07-16T08:00:00", cargo:"General / Hazmat", containers:1850, assignedBerth:"B-03", waitingTime:1.2, riskScore:42, status:"Approaching", riskFactors:["highArrivalVolume","yardPressure"], route:"Kaohsiung → Ningbo → Shanghai → Hamburg", priority:"High", grossTonnage:140000, length:366 },
  { id:"V-104", name:"MSC Adriana", flag:"Liberia", type:"Container", eta:"2026-07-15T08:30:00", etd:"2026-07-15T20:00:00", cargo:"General / Refrigerated", containers:847, assignedBerth:"B-03", waitingTime:2.4, riskScore:91, status:"Critical", riskFactors:["berthShortage","craneUnavailable","highArrivalVolume","yardZoneBCritical"], route:"Shanghai → Singapore → Dubai → Hamburg", priority:"High", grossTonnage:95000, length:320 },
  { id:"V-105", name:"Hapag Lloyd Kestrel", flag:"Germany", type:"Container", eta:"2026-07-15T09:00:00", etd:"2026-07-15T21:00:00", cargo:"General", containers:1100, assignedBerth:"B-04", waitingTime:1.8, riskScore:67, status:"Delayed", riskFactors:["berthShortage","highArrivalVolume"], route:"Busan → Tokyo → Long Beach → Hamburg", priority:"Normal", grossTonnage:88000, length:305 },
  { id:"V-106", name:"OOCL Neptune", flag:"Hong Kong", type:"Container", eta:"2026-07-15T09:30:00", etd:"2026-07-16T09:30:00", cargo:"Electronics", containers:2100, assignedBerth:"B-05", waitingTime:3.1, riskScore:74, status:"Delayed", riskFactors:["craneUnavailable","yardPressure","highArrivalVolume"], route:"Yantian → Port Klang → Colombo → Hamburg", priority:"High", grossTonnage:162000, length:400 },
  { id:"V-107", name:"Cosco Prosperity", flag:"China", type:"Bulk", eta:"2026-07-15T10:00:00", etd:"2026-07-15T22:00:00", cargo:"Bulk Grain", containers:0, assignedBerth:"B-06", waitingTime:0.3, riskScore:15, status:"On Time", riskFactors:[], route:"Brisbane → Port Hedland → Hamburg", priority:"Normal", grossTonnage:55000, length:225 },
  { id:"V-108", name:"Maersk Endeavour", flag:"Denmark", type:"Container", eta:"2026-07-15T10:30:00", etd:"2026-07-16T06:00:00", cargo:"General / Automotive", containers:1650, assignedBerth:"B-07", waitingTime:0.9, riskScore:31, status:"Approaching", riskFactors:["minorDelay"], route:"Algeciras → Rotterdam → Hamburg", priority:"Normal", grossTonnage:115000, length:350 },
  { id:"V-109", name:"Yang Ming Spirit", flag:"Taiwan", type:"Container", eta:"2026-07-15T11:00:00", etd:"2026-07-16T11:00:00", cargo:"General", containers:730, assignedBerth:"B-08", waitingTime:4.7, riskScore:83, status:"Critical", riskFactors:["berthShortage","longWait","yardZoneBCritical"], route:"Keelung → Osaka → Los Angeles → Hamburg", priority:"Low", grossTonnage:68000, length:260 },
  { id:"V-110", name:"Wan Hai Falcon", flag:"Taiwan", type:"Container", eta:"2026-07-15T11:30:00", etd:"2026-07-15T23:30:00", cargo:"Refrigerated", containers:510, assignedBerth:"B-09", waitingTime:0.2, riskScore:12, status:"On Time", riskFactors:[], route:"Manila → Kaohsiung → Hamburg", priority:"Normal", grossTonnage:42000, length:200 },
  { id:"V-111", name:"PIL Resilience", flag:"Singapore", type:"Container", eta:"2026-07-15T12:00:00", etd:"2026-07-16T12:00:00", cargo:"Hazmat", containers:320, assignedBerth:"B-10", waitingTime:1.0, riskScore:38, status:"Approaching", riskFactors:["hazmatHandling"], route:"Port Klang → Singapore → Hamburg", priority:"High", grossTonnage:30000, length:175 },
  { id:"V-112", name:"Zim Pacific", flag:"Israel", type:"Container", eta:"2026-07-15T13:00:00", etd:"2026-07-16T07:00:00", cargo:"General / Electronics", containers:1420, assignedBerth:"B-01", waitingTime:5.8, riskScore:86, status:"Critical", riskFactors:["berthShortage","longWait","craneUnavailable","highArrivalVolume"], route:"Haifa → Piraeus → Valencia → Hamburg", priority:"High", grossTonnage:98000, length:325 },
  { id:"V-113", name:"ONE Cosmos", flag:"Japan", type:"Container", eta:"2026-07-15T14:00:00", etd:"2026-07-16T14:00:00", cargo:"Automotive", containers:890, assignedBerth:"B-02", waitingTime:0.4, riskScore:20, status:"On Time", riskFactors:[], route:"Tokyo → Nagoya → Kobe → Hamburg", priority:"Normal", grossTonnage:77000, length:285 },
  { id:"V-114", name:"Arkas Antalya", flag:"Turkey", type:"Ro-Ro", eta:"2026-07-15T14:30:00", etd:"2026-07-15T22:30:00", cargo:"Vehicles / Machinery", containers:0, assignedBerth:"B-04", waitingTime:2.2, riskScore:55, status:"Waiting", riskFactors:["berthUnavailable","schedulingConflict"], route:"Istanbul → Marseille → Hamburg", priority:"Normal", grossTonnage:48000, length:220 },
  { id:"V-115", name:"Seaspan Reliance", flag:"Canada", type:"Container", eta:"2026-07-15T15:00:00", etd:"2026-07-16T15:00:00", cargo:"General", containers:1180, assignedBerth:"B-05", waitingTime:3.8, riskScore:71, status:"Delayed", riskFactors:["yardPressure","highArrivalVolume","craneConflict"], route:"Vancouver → Prince Rupert → Hamburg", priority:"Normal", grossTonnage:89000, length:308 },
  { id:"V-116", name:"Grimaldi Europa", flag:"Italy", type:"Ro-Ro", eta:"2026-07-15T16:00:00", etd:"2026-07-16T04:00:00", cargo:"Vehicles", containers:0, assignedBerth:"B-06", waitingTime:0.6, riskScore:22, status:"On Time", riskFactors:[], route:"Salerno → Barcelona → Hamburg", priority:"Normal", grossTonnage:56000, length:235 },
  { id:"V-117", name:"X-Press Tropics", flag:"Singapore", type:"Container", eta:"2026-07-15T16:30:00", etd:"2026-07-16T10:00:00", cargo:"Perishables", containers:450, assignedBerth:"B-07", waitingTime:2.9, riskScore:63, status:"Delayed", riskFactors:["perishablePriority","berthConflict"], route:"Durban → Mombasa → Hamburg", priority:"High", grossTonnage:35000, length:190 },
  { id:"V-118", name:"CSAV Tyndall", flag:"Chile", type:"Container", eta:"2026-07-15T17:00:00", etd:"2026-07-16T17:00:00", cargo:"General / Refrigerated", containers:760, assignedBerth:"B-08", waitingTime:1.3, riskScore:36, status:"Approaching", riskFactors:["minorDelay"], route:"Valparaiso → Callao → Hamburg", priority:"Normal", grossTonnage:62000, length:255 },
  { id:"V-119", name:"Hyundai Loyalty", flag:"South Korea", type:"Container", eta:"2026-07-15T18:00:00", etd:"2026-07-16T18:00:00", cargo:"Electronics / Machinery", containers:1920, assignedBerth:"B-09", waitingTime:4.1, riskScore:78, status:"Delayed", riskFactors:["highArrivalVolume","yardPressure","longWait"], route:"Busan → Qingdao → Hamburg", priority:"High", grossTonnage:145000, length:370 },
  { id:"V-120", name:"Emirates Skyline", flag:"UAE", type:"Container", eta:"2026-07-15T18:30:00", etd:"2026-07-16T06:30:00", cargo:"General", containers:640, assignedBerth:"B-10", waitingTime:0.7, riskScore:27, status:"On Time", riskFactors:[], route:"Jebel Ali → Salalah → Hamburg", priority:"Normal", grossTonnage:52000, length:228 },
  { id:"V-121", name:"Borchard Clementine", flag:"UK", type:"Container", eta:"2026-07-15T19:00:00", etd:"2026-07-16T19:00:00", cargo:"General", containers:380, assignedBerth:"B-01", waitingTime:6.2, riskScore:88, status:"Critical", riskFactors:["berthShortage","longWait","craneUnavailable","highArrivalVolume"], route:"Felixstowe → Rotterdam → Hamburg", priority:"Normal", grossTonnage:28000, length:165 },
  { id:"V-122", name:"Pacific Basin Kestrel", flag:"Hong Kong", type:"Bulk", eta:"2026-07-15T20:00:00", etd:"2026-07-16T08:00:00", cargo:"Iron Ore", containers:0, assignedBerth:"B-02", waitingTime:0.3, riskScore:14, status:"On Time", riskFactors:[], route:"Port Hedland → Dampier → Hamburg", priority:"Normal", grossTonnage:82000, length:290 },
  { id:"V-123", name:"Evergreen Sunrise", flag:"Taiwan", type:"Container", eta:"2026-07-15T20:30:00", etd:"2026-07-16T20:30:00", cargo:"Automotive / General", containers:1550, assignedBerth:"B-03", waitingTime:3.5, riskScore:69, status:"Delayed", riskFactors:["berthConflict","yardPressure"], route:"Taichung → Kobe → Hamburg", priority:"Normal", grossTonnage:120000, length:355 },
  { id:"V-124", name:"MSC Letizia", flag:"Switzerland", type:"Container", eta:"2026-07-16T02:00:00", etd:"2026-07-16T22:00:00", cargo:"Refrigerated / Perishables", containers:900, assignedBerth:"B-04", waitingTime:1.5, riskScore:45, status:"Approaching", riskFactors:["yardPressure"], route:"Santos → Buenos Aires → Hamburg", priority:"High", grossTonnage:73000, length:278 },
  { id:"V-125", name:"Hapag Bremen", flag:"Germany", type:"Container", eta:"2026-07-16T04:00:00", etd:"2026-07-17T04:00:00", cargo:"Machinery", containers:1300, assignedBerth:"B-05", waitingTime:0.0, riskScore:29, status:"On Time", riskFactors:[], route:"Bremerhaven → Rotterdam → Hamburg", priority:"Normal", grossTonnage:96000, length:318 },
  { id:"V-126", name:"Maersk Challenger", flag:"Denmark", type:"Container", eta:"2026-07-16T06:00:00", etd:"2026-07-17T06:00:00", cargo:"General / Electronics", containers:1750, assignedBerth:"B-06", waitingTime:2.7, riskScore:58, status:"Waiting", riskFactors:["berthConflict","craneConflict"], route:"Tanjung Pelepas → Colombo → Hamburg", priority:"Normal", grossTonnage:130000, length:362 },
  { id:"V-127", name:"Cosco Abundance", flag:"China", type:"Container", eta:"2026-07-16T08:00:00", etd:"2026-07-17T08:00:00", cargo:"General", containers:2400, assignedBerth:"B-07", waitingTime:0.0, riskScore:33, status:"Approaching", riskFactors:["highContainerVolume"], route:"Ningbo → Xiamen → Singapore → Hamburg", priority:"Normal", grossTonnage:185000, length:400 },
  { id:"V-128", name:"Seatrade Orange", flag:"Netherlands", type:"Reefer", eta:"2026-07-16T10:00:00", etd:"2026-07-16T22:00:00", cargo:"Perishables / Fruit", containers:280, assignedBerth:"B-08", waitingTime:0.5, riskScore:19, status:"On Time", riskFactors:[], route:"Cape Town → Walvis Bay → Hamburg", priority:"High", grossTonnage:22000, length:150 },
  { id:"V-129", name:"Thoresen Titan", flag:"Thailand", type:"Bulk", eta:"2026-07-16T12:00:00", etd:"2026-07-17T04:00:00", cargo:"Coal", containers:0, assignedBerth:"B-09", waitingTime:1.8, riskScore:48, status:"Waiting", riskFactors:["berthUnavailable"], route:"Newcastle → Port Waratah → Hamburg", priority:"Normal", grossTonnage:76000, length:280 },
  { id:"V-130", name:"Gold Star Navigator", flag:"Marshall Islands", type:"Container", eta:"2026-07-16T14:00:00", etd:"2026-07-17T14:00:00", cargo:"General / Hazmat", containers:1050, assignedBerth:"B-10", waitingTime:2.0, riskScore:53, status:"Waiting", riskFactors:["hazmatHandling","yardPressure"], route:"Houston → New York → Hamburg", priority:"Normal", grossTonnage:84000, length:298 }
];

// ─── BERTHS ───────────────────────────────────────────────────────────────────
const BERTHS_DATA = [
  { id:"B-01", name:"Berth 01", location:"North Terminal", capacity:2000, currentVessel:"V-121", nextVessel:"V-101", availableAt:"2026-07-16T06:00:00", cranes:["C-01","C-02"], status:"Occupied", utilisation:94, length:350, depth:16, schedule:[{vessel:"V-121",start:"2026-07-15T06:00:00",end:"2026-07-16T06:00:00"},{vessel:"V-101",start:"2026-07-16T06:00:00",end:"2026-07-16T18:00:00"}] },
  { id:"B-02", name:"Berth 02", location:"North Terminal", capacity:1800, currentVessel:"V-102", nextVessel:"V-113", availableAt:"2026-07-15T19:30:00", cranes:["C-03","C-04"], status:"Occupied", utilisation:78, length:320, depth:15, schedule:[{vessel:"V-102",start:"2026-07-15T07:30:00",end:"2026-07-15T19:30:00"},{vessel:"V-113",start:"2026-07-15T20:00:00",end:"2026-07-16T14:00:00"}] },
  { id:"B-03", name:"Berth 03", location:"East Terminal", capacity:3000, currentVessel:"V-103", nextVessel:"V-104", availableAt:"2026-07-15T09:00:00", cranes:["C-05","C-06"], status:"Congested", utilisation:100, length:400, depth:18, schedule:[{vessel:"V-103",start:"2026-07-15T08:00:00",end:"2026-07-16T08:00:00"},{vessel:"V-104",start:"2026-07-16T08:00:00",end:"2026-07-16T20:00:00"},{vessel:"V-123",start:"2026-07-16T20:30:00",end:"2026-07-17T20:30:00"}] },
  { id:"B-04", name:"Berth 04", location:"East Terminal", capacity:2200, currentVessel:"V-105", nextVessel:"V-114", availableAt:"2026-07-15T21:00:00", cranes:["C-07","C-08"], status:"Occupied", utilisation:82, length:360, depth:16, schedule:[{vessel:"V-105",start:"2026-07-15T09:00:00",end:"2026-07-15T21:00:00"},{vessel:"V-114",start:"2026-07-15T22:30:00",end:"2026-07-16T06:30:00"},{vessel:"V-124",start:"2026-07-16T08:00:00",end:"2026-07-17T04:00:00"}] },
  { id:"B-05", name:"Berth 05", location:"South Terminal", capacity:2800, currentVessel:"V-106", nextVessel:"V-115", availableAt:"2026-07-16T09:30:00", cranes:["C-09","C-10"], status:"Congested", utilisation:97, length:390, depth:17, schedule:[{vessel:"V-106",start:"2026-07-15T09:30:00",end:"2026-07-16T09:30:00"},{vessel:"V-115",start:"2026-07-16T10:00:00",end:"2026-07-17T10:00:00"},{vessel:"V-125",start:"2026-07-17T04:00:00",end:"2026-07-18T04:00:00"}] },
  { id:"B-06", name:"Berth 06", location:"South Terminal", capacity:1500, currentVessel:"V-107", nextVessel:"V-116", availableAt:"2026-07-15T22:00:00", cranes:["C-11","C-12"], status:"Occupied", utilisation:65, length:280, depth:14, schedule:[{vessel:"V-107",start:"2026-07-15T10:00:00",end:"2026-07-15T22:00:00"},{vessel:"V-116",start:"2026-07-16T00:00:00",end:"2026-07-16T12:00:00"},{vessel:"V-126",start:"2026-07-16T13:00:00",end:"2026-07-17T13:00:00"}] },
  { id:"B-07", name:"Berth 07", location:"West Terminal", capacity:2500, currentVessel:null, nextVessel:"V-108", availableAt:"2026-07-15T10:30:00", cranes:["C-13"], status:"Available", utilisation:20, length:370, depth:16, schedule:[{vessel:"V-108",start:"2026-07-15T10:30:00",end:"2026-07-16T06:00:00"},{vessel:"V-117",start:"2026-07-16T07:00:00",end:"2026-07-16T21:00:00"},{vessel:"V-127",start:"2026-07-17T00:00:00",end:"2026-07-18T00:00:00"}] },
  { id:"B-08", name:"Berth 08", location:"West Terminal", capacity:1600, currentVessel:"V-109", nextVessel:"V-118", availableAt:"2026-07-16T11:00:00", cranes:["C-14"], status:"Occupied", utilisation:88, length:295, depth:15, schedule:[{vessel:"V-109",start:"2026-07-15T11:00:00",end:"2026-07-16T11:00:00"},{vessel:"V-118",start:"2026-07-16T12:00:00",end:"2026-07-17T12:00:00"},{vessel:"V-128",start:"2026-07-17T12:00:00",end:"2026-07-18T00:00:00"}] },
  { id:"B-09", name:"Berth 09", location:"North Terminal", capacity:1200, currentVessel:"V-110", nextVessel:"V-119", availableAt:"2026-07-15T23:30:00", cranes:["C-15"], status:"Occupied", utilisation:71, length:260, depth:13, schedule:[{vessel:"V-110",start:"2026-07-15T11:30:00",end:"2026-07-15T23:30:00"},{vessel:"V-119",start:"2026-07-16T00:00:00",end:"2026-07-17T00:00:00"},{vessel:"V-129",start:"2026-07-17T04:00:00",end:"2026-07-18T04:00:00"}] },
  { id:"B-10", name:"Berth 10", location:"East Terminal", capacity:1400, currentVessel:"V-111", nextVessel:"V-120", availableAt:"2026-07-16T12:00:00", cranes:["C-01","C-03"], status:"Occupied", utilisation:76, length:275, depth:14, schedule:[{vessel:"V-111",start:"2026-07-15T12:00:00",end:"2026-07-16T12:00:00"},{vessel:"V-120",start:"2026-07-16T13:00:00",end:"2026-07-17T01:00:00"},{vessel:"V-130",start:"2026-07-17T02:00:00",end:"2026-07-18T02:00:00"}] }
];

// ─── CRANES ───────────────────────────────────────────────────────────────────
const CRANES_DATA = [
  { id:"C-01", name:"STS Crane 01", type:"Ship-to-Shore", location:"B-01", status:"Active", utilisation:88, currentVessel:"V-121", capacity:35, liftsPerHour:28, maintenanceDue:"2026-07-20", notes:"Operating within normal parameters." },
  { id:"C-02", name:"STS Crane 02", type:"Ship-to-Shore", location:"B-01", status:"Idle", utilisation:12, currentVessel:null, capacity:35, liftsPerHour:30, maintenanceDue:"2026-07-22", notes:"Standby. Available for immediate deployment." },
  { id:"C-03", name:"STS Crane 03", type:"Ship-to-Shore", location:"B-02", status:"Idle", utilisation:8, currentVessel:null, capacity:40, liftsPerHour:32, maintenanceDue:"2026-07-25", notes:"Underutilised. Recommended for reassignment to B-03." },
  { id:"C-04", name:"STS Crane 04", type:"Ship-to-Shore", location:"B-02", status:"Maintenance", utilisation:0, currentVessel:null, capacity:40, liftsPerHour:0, maintenanceDue:"2026-07-15", notes:"Hydraulic system overhaul. ETA back online: 2026-07-16 18:00." },
  { id:"C-05", name:"STS Crane 05", type:"Ship-to-Shore", location:"B-03", status:"Active", utilisation:95, currentVessel:"V-103", capacity:45, liftsPerHour:34, maintenanceDue:"2026-07-28", notes:"High utilisation. Monitor closely." },
  { id:"C-06", name:"STS Crane 06", type:"Ship-to-Shore", location:"B-03", status:"Overloaded", utilisation:102, currentVessel:"V-103", capacity:45, liftsPerHour:36, maintenanceDue:"2026-07-18", notes:"Exceeding rated capacity. Immediate attention required." },
  { id:"C-07", name:"RTG Crane 07", type:"Rubber-Tyred Gantry", location:"B-04", status:"Active", utilisation:72, currentVessel:"V-105", capacity:25, liftsPerHour:22, maintenanceDue:"2026-07-30", notes:"Normal operations." },
  { id:"C-08", name:"RTG Crane 08", type:"Rubber-Tyred Gantry", location:"B-04", status:"Active", utilisation:68, currentVessel:"V-105", capacity:25, liftsPerHour:21, maintenanceDue:"2026-08-02", notes:"Normal operations." },
  { id:"C-09", name:"STS Crane 09", type:"Ship-to-Shore", location:"B-05", status:"Active", utilisation:91, currentVessel:"V-106", capacity:42, liftsPerHour:33, maintenanceDue:"2026-07-21", notes:"High load. Due for inspection soon." },
  { id:"C-10", name:"STS Crane 10", type:"Ship-to-Shore", location:"B-05", status:"Active", utilisation:85, currentVessel:"V-106", capacity:42, liftsPerHour:31, maintenanceDue:"2026-07-26", notes:"Normal high-load operations." },
  { id:"C-11", name:"RTG Crane 11", type:"Rubber-Tyred Gantry", location:"B-06", status:"Active", utilisation:55, currentVessel:"V-107", capacity:25, liftsPerHour:20, maintenanceDue:"2026-08-05", notes:"Normal operations." },
  { id:"C-12", name:"RMG Crane 12", type:"Rail-Mounted Gantry", location:"B-06", status:"Idle", utilisation:5, currentVessel:null, capacity:50, liftsPerHour:0, maintenanceDue:"2026-08-10", notes:"Available. Awaiting assignment." },
  { id:"C-13", name:"STS Crane 13", type:"Ship-to-Shore", location:"B-07", status:"Active", utilisation:22, currentVessel:null, capacity:38, liftsPerHour:12, maintenanceDue:"2026-08-01", notes:"Low utilisation. Ready for incoming V-108." },
  { id:"C-14", name:"STS Crane 14", type:"Ship-to-Shore", location:"B-08", status:"Active", utilisation:78, currentVessel:"V-109", capacity:38, liftsPerHour:27, maintenanceDue:"2026-07-29", notes:"Normal operations." },
  { id:"C-15", name:"RTG Crane 15", type:"Rubber-Tyred Gantry", location:"B-09", status:"Maintenance", utilisation:0, currentVessel:null, capacity:22, liftsPerHour:0, maintenanceDue:"2026-07-15", notes:"Electrical fault. ETA back online: 2026-07-15 20:00." }
];

// ─── YARD ZONES ───────────────────────────────────────────────────────────────
const YARD_DATA = {
  totalCapacity: 12000,
  zones: [
    { id:"YZ-A", name:"Zone A", terminal:"North Terminal", capacity:2000, occupied:1280, type:"General", status:"Normal", lastUpdate:"2026-07-15T07:45:00" },
    { id:"YZ-B", name:"Zone B", terminal:"East Terminal", capacity:3000, occupied:2730, type:"General / Refrigerated", status:"Critical", lastUpdate:"2026-07-15T07:50:00" },
    { id:"YZ-C", name:"Zone C", terminal:"East Terminal", capacity:2500, occupied:1300, type:"General", status:"Normal", lastUpdate:"2026-07-15T07:48:00" },
    { id:"YZ-D", name:"Zone D", terminal:"South Terminal", capacity:1800, occupied:1494, type:"Hazmat / General", status:"High", lastUpdate:"2026-07-15T07:52:00" },
    { id:"YZ-E", name:"Zone E", terminal:"South Terminal", capacity:1200, occupied:588, type:"General", status:"Normal", lastUpdate:"2026-07-15T07:40:00" },
    { id:"YZ-F", name:"Zone F", terminal:"West Terminal", capacity:1500, occupied:960, type:"Refrigerated", status:"Normal", lastUpdate:"2026-07-15T07:44:00" }
  ]
};

// ─── DISRUPTIONS ──────────────────────────────────────────────────────────────
const DISRUPTIONS_DATA = [
  { id:"D-001", type:"Weather", subtype:"Heavy Rain", severity:"High", location:"North Terminal", affectedBerths:["B-01","B-02","B-09"], affectedVessels:["V-101","V-102","V-121"], startTime:"2026-07-15T06:00:00", expectedDuration:8, estimatedImpact:"Reduced crane operations. 3 vessels may face 2–4 hour delays.", status:"Active", description:"Heavy rainfall reducing visibility and crane operating speed by 40%." },
  { id:"D-002", type:"Equipment", subtype:"Crane Failure", severity:"Critical", location:"Berth 03", affectedBerths:["B-03"], affectedVessels:["V-103","V-104"], startTime:"2026-07-15T07:15:00", expectedDuration:12, estimatedImpact:"Berth 03 operating at 50% crane capacity. V-104 delay estimated at 6 hours.", status:"Active", description:"STS Crane 06 hydraulic failure. Maintenance team on-site." },
  { id:"D-003", type:"Port Operations", subtype:"Berth Closure", severity:"High", location:"East Terminal Berth 03", affectedBerths:["B-03"], affectedVessels:["V-104","V-123"], startTime:"2026-07-15T09:00:00", expectedDuration:6, estimatedImpact:"Berth 03 closure forces V-104 to queue. Estimated 5-hour additional delay.", status:"Active", description:"Structural inspection required on Berth 03 quay apron. Emergency closure." },
  { id:"D-004", type:"Weather", subtype:"Storm", severity:"Medium", location:"Outer Harbour", affectedBerths:[], affectedVessels:["V-119","V-126","V-127"], startTime:"2026-07-15T14:00:00", expectedDuration:6, estimatedImpact:"Incoming vessels may face 1–2 hour navigation delays in outer harbour.", status:"Active", description:"Force 6 winds forecast in outer harbour. Pilot boarding may be delayed." },
  { id:"D-005", type:"Labour", subtype:"Port Strike", severity:"Critical", location:"South Terminal", affectedBerths:["B-05","B-06"], affectedVessels:["V-106","V-107","V-115","V-116"], startTime:"2026-07-15T12:00:00", expectedDuration:24, estimatedImpact:"South Terminal at 30% staffing. Estimated turnaround time doubled.", status:"Active", description:"Stevedore union work-to-rule action. Labour output severely reduced." },
  { id:"D-006", type:"Equipment", subtype:"Crane Failure", severity:"Medium", location:"Berth 02", affectedBerths:["B-02"], affectedVessels:["V-102","V-113"], startTime:"2026-07-14T22:00:00", expectedDuration:20, estimatedImpact:"C-04 offline reduces B-02 throughput by 50%.", status:"Active", description:"STS Crane 04 undergoing hydraulic system overhaul. Single crane operation at B-02." },
  { id:"D-007", type:"Infrastructure", subtype:"Road Congestion", severity:"Medium", location:"Port Gate 2 / A7 Motorway", affectedBerths:[], affectedVessels:[], startTime:"2026-07-15T07:00:00", expectedDuration:5, estimatedImpact:"Truck access delays. Container collection turnaround time +1.5 hours.", status:"Active", description:"A7 motorway incident causing significant HGV queuing at Port Gate 2." },
  { id:"D-008", type:"Weather", subtype:"Fog", severity:"Low", location:"Approach Channel", affectedBerths:[], affectedVessels:["V-124","V-125"], startTime:"2026-07-16T03:00:00", expectedDuration:3, estimatedImpact:"Reduced vessel approach speed. Minor ETA delays expected.", status:"Forecast", description:"Dense fog advisory for approach channel. Pilot vessels on standby." },
  { id:"D-009", type:"Equipment", subtype:"Equipment Failure", severity:"Low", location:"Yard Zone C", affectedBerths:[], affectedVessels:[], startTime:"2026-07-15T10:30:00", expectedDuration:4, estimatedImpact:"Yard vehicle breakdown reduces Zone C throughput by 20%.", status:"Active", description:"Reach stacker RS-07 hydraulic fault. Backup equipment mobilised." },
  { id:"D-010", type:"Weather", subtype:"High Wind", severity:"High", location:"West Terminal", affectedBerths:["B-07","B-08"], affectedVessels:["V-108","V-109","V-117"], startTime:"2026-07-15T16:00:00", expectedDuration:10, estimatedImpact:"Crane operations suspended at B-07 and B-08. Estimated 3-hour delay for affected vessels.", status:"Forecast", description:"Wind speed forecast to exceed 60 km/h at West Terminal. STS crane operations will be suspended." }
];

// ─── RISK FACTOR LABELS ───────────────────────────────────────────────────────
const RISK_FACTOR_LABELS = {
  berthShortage:       "Berth availability is critically low",
  craneUnavailable:    "Assigned crane is offline or in maintenance",
  highArrivalVolume:   "High number of vessels arriving in the same window",
  yardZoneBCritical:   "Yard Zone B is approaching critical capacity (91%)",
  yardPressure:        "Yard utilisation is elevated across multiple zones",
  longWait:            "Vessel has been waiting beyond the acceptable threshold",
  berthConflict:       "Schedule conflict at the assigned berth",
  craneConflict:       "Crane allocation conflict with another vessel",
  berthUnavailable:    "Assigned berth is temporarily unavailable",
  schedulingConflict:  "Scheduling conflict detected in berth plan",
  hazmatHandling:      "Vessel carries hazardous materials requiring special handling",
  perishablePriority:  "Vessel carries perishable cargo with time-critical unloading",
  minorDelay:          "Minor schedule deviation detected",
  highContainerVolume: "Exceptionally high container count requires extended crane time"
};

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────
const NOTIFICATIONS_DATA = [
  { id:"N-001", level:"critical", title:"Critical delay risk: V-104", message:"MSC Adriana (V-104) has a 91% risk score. Berth 03 congestion and Crane C-06 failure are primary causes. Immediate action required.", time:"07:52", read:false },
  { id:"N-002", level:"critical", title:"Crane C-06 failure confirmed", message:"STS Crane 06 at Berth 03 has experienced a hydraulic failure. Maintenance team on-site. ETA: 12 hours.", time:"07:15", read:false },
  { id:"N-003", level:"warning", title:"Yard Zone B at 91% utilisation", message:"Zone B is approaching critical capacity. Recommend redistributing containers to Zone C (52% utilised).", time:"07:50", read:false },
  { id:"N-004", level:"warning", title:"V-112 waiting time exceeds 5 hours", message:"Zim Pacific has been waiting for 5.8 hours. Risk score elevated to 86 (Critical).", time:"07:30", read:false },
  { id:"N-005", level:"warning", title:"South Terminal labour action", message:"Stevedore work-to-rule at South Terminal. Berths 05 and 06 operating at reduced capacity.", time:"07:00", read:false },
  { id:"N-006", level:"advisory", title:"Crane C-03 underutilised (8%)", message:"STS Crane 03 at Berth 02 is at 8% utilisation. Consider reassigning to Berth 03 to compensate for C-06 failure.", time:"06:45", read:true },
  { id:"N-007", level:"advisory", title:"Fog advisory: Approach Channel", message:"Dense fog forecast from 03:00 tomorrow. V-124 and V-125 may experience minor ETA delays.", time:"06:30", read:true },
  { id:"N-008", level:"advisory", title:"V-121 delay accumulating", message:"Borchard Clementine waiting time now 6.2 hours. Risk elevated to 88 (Critical).", time:"06:00", read:true }
];

// ─── DATA ACCESS HELPERS ──────────────────────────────────────────────────────

function getVessels()        { return VESSELS_DATA; }
function getBerths()         { return BERTHS_DATA; }
function getCranes()         { return CRANES_DATA; }
function getYard()           { return YARD_DATA; }
function getDisruptions()    { return DISRUPTIONS_DATA; }
function getNotifications()  { return NOTIFICATIONS_DATA; }

function getVesselById(id) {
  return VESSELS_DATA.find(v => v.id === id) || null;
}

function getBerthById(id) {
  return BERTHS_DATA.find(b => b.id === id) || null;
}

function getCraneById(id) {
  return CRANES_DATA.find(c => c.id === id) || null;
}

function getHighRiskVessels() {
  return VESSELS_DATA.filter(v => v.riskScore > 60).sort((a,b) => b.riskScore - a.riskScore);
}

function getCriticalVessels() {
  return VESSELS_DATA.filter(v => v.riskScore > 80).sort((a,b) => b.riskScore - a.riskScore);
}

function getActiveDisruptions() {
  return DISRUPTIONS_DATA.filter(d => d.status === 'Active');
}

function getIdleCranes() {
  return CRANES_DATA.filter(c => c.status === 'Idle');
}

function getYardUtilisationPct() {
  const total  = YARD_DATA.zones.reduce((s,z) => s + z.capacity, 0);
  const used   = YARD_DATA.zones.reduce((s,z) => s + z.occupied, 0);
  return Math.round((used / total) * 100);
}

function getOverallCraneUtilisation() {
  const active = CRANES_DATA.filter(c => c.status !== 'Maintenance');
  const avg    = active.reduce((s,c) => s + c.utilisation, 0) / active.length;
  return Math.round(avg);
}

function getAverageWaitingTime() {
  const waiting = VESSELS_DATA.filter(v => v.waitingTime > 0);
  if (!waiting.length) return 0;
  const avg = waiting.reduce((s,v) => s + v.waitingTime, 0) / waiting.length;
  return avg.toFixed(1);
}

function getVesselsInPort() {
  return VESSELS_DATA.filter(v => ['On Time','Approaching','Waiting','Delayed','Critical'].includes(v.status)).length;
}

function getArrivalsNext24h() {
  const cutoff = new Date('2026-07-16T08:00:00');
  return VESSELS_DATA.filter(v => new Date(v.eta) <= cutoff).length;
}

/** Overall port congestion risk 0-100 */
function getPortCongestionRisk() {
  const criticalBerths = BERTHS_DATA.filter(b => b.status === 'Congested').length;
  const criticalVessels = getCriticalVessels().length;
  const yardUtil = getYardUtilisationPct();
  const activeDisruptions = getActiveDisruptions().length;

  let score = 0;
  score += criticalBerths  * 8;   // max ~80
  score += criticalVessels * 4;   // max ~20
  score += Math.max(0, yardUtil - 60) * 0.8;
  score += activeDisruptions * 3;
  return Math.min(100, Math.round(score));
}

/** Return human-readable label for a risk factor key */
function getRiskFactorLabel(key) {
  return RISK_FACTOR_LABELS[key] || key;
}

/** Return CSS risk class based on score */
function getRiskClass(score) {
  if (score >= 81) return 'critical';
  if (score >= 61) return 'high';
  if (score >= 31) return 'medium';
  return 'low';
}

/** Return CSS status class */
function getStatusClass(status) {
  const map = {
    'Critical':   'critical',
    'Delayed':    'high',
    'High':       'high',
    'Waiting':    'medium',
    'Approaching':'medium',
    'On Time':    'low',
    'Active':     'low',
    'Normal':     'low',
    'Idle':       'idle',
    'Maintenance':'warning',
    'Overloaded': 'critical',
    'Congested':  'critical',
    'Occupied':   'medium',
    'Available':  'low',
    'Forecast':   'medium',
    'Resolved':   'idle'
  };
  return map[status] || 'idle';
}

/** Format ISO date string to readable format */
function formatDateTime(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day:'2-digit', month:'short' }) + ' ' +
         d.toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' });
}

function formatTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' });
}
