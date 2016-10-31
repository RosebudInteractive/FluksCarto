/**
 * Created by kiknadze on 01.02.2016.
 */
var data = {
    data: {
        services: [
            {
                id: "1",
                name: "Service A",
                description: "Service A description",
                data: {},
                services: [
                    {
                        id: "1_1",
                        name: "Service B",
                        description: "Service B description",
                        services: [
                            {
                                id: "1_1_1",
                                name: "Service C",
                                description: "Service B description",
                                sectors: [
                                    {
                                        id: "s1",
                                        name: "Sector 1",
                                        description: "Sector 1 description",
                                        active: "#ff0000",
                                        data: {
                                            Temperature: 20,
                                            SomeData: "Custom data"
                                        },
                                        equipments: ["8", "9"]
                                    },
                                    {
                                        id: "s2",
                                        name: "Sector 2",
                                        description: "Sector 2 description",
                                        active: "#bcbcbc",
                                        data: {},
                                        equipments: ["10"]
                                    }
                                ],
                                equipments:["13"]
                            },
                            {
                                id: "5",
                                name: "Service C",
                                description: "Service C description",
                                sectors: [
                                    {
                                        id: "s3",
                                        name: "Sector 3",
                                        description: "Sector 3 description",
                                        active: "#ffff00",
                                        data: {},
                                        equipments: []
                                    },
                                    {
                                        id: "s4",
                                        name: "Sector 4",
                                        description: "Sector 4 description",
                                        active: "#ff0000",
                                        data: {},
                                        equipments: ["11", "12"]
                                    }
                                ],
                                services: [
                                    {
                                        id: "2",
                                        name: "Service B",
                                        description: "Service B description",
                                        sectors: [
                                            {
                                                id: "s5",
                                                name: "Sector 5",
                                                description: "Sector 5 description",
                                                active: "#ff0000",
                                                data: {},
                                                equipments: ["8", "9"]
                                            },
                                            {
                                                id: "s6",
                                                name: "Sector 6",
                                                description: "Sector 6 description",
                                                active: "#ff0000",
                                                data: {},
                                                equipments: ["10"]
                                            }
                                        ],
                                        equipments:["13"]
                                    },
                                    {
                                        id: "5",
                                        name: "Service C",
                                        description: "Service C description",
                                        sectors: [
                                            {
                                                id: "s6_2",
                                                name: "Sector 6_2",
                                                description: "Sector 6_2 description",
                                                active: "#ff0000",
                                                data: {},
                                                equipments: []
                                            },
                                            {
                                                id: "s7",
                                                name: "Sector 7",
                                                description: "Sector 7 description",
                                                active: "#ff0000",
                                                data: {},
                                                equipments: ["11", "12"]
                                            }
                                        ],
                                        services: [
                                            {
                                                id: "2",
                                                name: "Service B",
                                                description: "Service B description",
                                                sectors: [
                                                    {
                                                        id: "s8",
                                                        name: "Sector 8",
                                                        description: "Sector 8 description",
                                                        active: "#ff0000",
                                                        data: {},
                                                        equipments: ["8", "9"]
                                                    },
                                                    {
                                                        id: "s9",
                                                        name: "Sector 9",
                                                        description: "Sector 9 description",
                                                        active: "#ff0000",
                                                        data: {},
                                                        equipments: ["10"]
                                                    }
                                                ],
                                                equipments:["13"]
                                            },
                                            {
                                                id: "5",
                                                name: "Service C",
                                                description: "Service C description",
                                                sectors: [
                                                    {
                                                        id: "s10",
                                                        name: "Sector 10",
                                                        description: "Sector 10 description",
                                                        active: "#ff0000",
                                                        data: {},
                                                        equipments: []
                                                    },
                                                    {
                                                        id: "s11",
                                                        name: "Sector 11",
                                                        description: "Sector 11 description",
                                                        active: "#ff0000",
                                                        data: {},
                                                        equipments: ["11", "12"]
                                                    }
                                                ],
                                                equipments:["13"]
                                            }
                                        ],
                                        equipments:["13"]
                                    }
                                ],
                                equipments:["13"]
                            }
                        ],
                        sectors: [
                            {
                                id: "s12",
                                name: "Sector 12",
                                description: "Sector 12 description",
                                active: "#ff0000",
                                data: {},
                                equipments: ["8", "9"]
                            },
                            {
                                id: "s13",
                                name: "Sector 13",
                                description: "Sector 13 description",
                                active: "#ff0000",
                                data: {},
                                equipments: ["10"]
                            }
                        ],
                        equipments:["13"]
                    }
                ],
                sectors: []
            }],
        equipments: [
            {
                id: "8",
                name: "Equipment a",
                nature: "Tank",
                coordinates: {},
                description: "Equipment a description",
                active: "#ff0000",
                data: {
                    Pressure: "2 bar",
                    WaterTemperature: "+4C",
                    Expense: "1000 m3",
                    Status: "Opened",
                    AirTemperature: "+20C"
                }
            },
            {
                id: "9",
                name: "Equipment b",
                nature: "Camera",
                coordinates: {},
                description: "Equipment b description",
                active: false,
                data: {}
            },
            {
                id: "10",
                name: "Equipment c",
                nature: "Tank",
                coordinates: {},
                description: "Equipment c description",
                active: "#ff0000",
                data: {
                    Pressure: "2.2 bar",
                    WaterTemperature: "+5C",
                    Expense: "2000 m3",
                    Status: "Closed",
                    AirTemperature: "+19C"
                }
            },
            {
                id: "11",
                name: "Equipment d",
                nature: "Termometer",
                coordinates: {},
                description: "Equipment d description",
                active: "#ff0000",
                data: {}
            },
            {
                id: "12",
                name: "Equipment e",
                nature: "Sensor",
                coordinates: {},
                description: "Equipment e description",
                active: "#ff0000",
                data: {}
            },
            {
                id: "13",
                name: "Equipment f",
                nature: "Tank",
                coordinates: {},
                description: "Equipment f description",
                active: "#ff0000",
                data: {}
            }
        ],
        natures: {
            Tank: "img/Water Tower-48.png",
            Camera: "img/Video Call-52.png",
            Termometer: "img/Thermometer Automation Filled-50.png",
            Sensor: "img/Sensor-50.png"
        },
        scheme: {
            backgroundImage: "http://maps.googleapis.com/maps/api/staticmap?size=1024x768&zoom=15&center=48.852456,2.350216&mapType=HYBRID&sensor=false",
            views: [
                {
                    id: "12345",
                    viewType: "EquipmentView",
                    equipment: "10",
                    x: 200,
                    y: 60,
                    width: 216,
                    height: 129,
                    background: "#0c0",
                    stroke: "#060",
                    title: {
                        id: "123457",
                        x: -120,
                        y: -21,
                        color: "blue"
                    },
                    icon: {
                        id: "123456",
                        x: -150,
                        y: -15,
                        width: null,
                        height: null,
                        url: null
                    }
                },
                {
                    id: "555555",
                    viewType: "PolygonView",
                    x: 120,
                    y: 250,
                    background: "#ff0000",
                    stroke: "#cb0000",
                    points: [
                        0, 0,
                        50, 0,
                        80, 20,
                        60, 70,
                        0, 70
                    ]
                },
                {
                    id: "secView1",
                    viewType: "SectorView",
                    sector: "s1",
                    x: 390,
                    y: 420,
                    width: 216,
                    height: 129,
                    background: "#0c0",
                    stroke: "#060",
                    title: {
                        id: "t2",
                        x: 0,
                        y: -5,
                        color: "blue"
                    }
                },
                {
                    id: "textView1",
                    viewType: "TitleView",
                    x: 290,
                    y: 520,
                    color: "#FFFF00",
                    text: "Good text for example"
                }
            ]
        }
    }
};
