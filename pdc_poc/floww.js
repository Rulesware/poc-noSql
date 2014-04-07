{
    "bpmn2:definitions": {
        "$": {
            "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instanc e",
            "xmlns:bpmn2": "http://www.omg.org/spec/BPMN/20100524/MODEL",
            "xmlns:bpmndi": "h ttp://www.omg.org/spec/BPMN/20100524/DI",
            "xmlns:dc": "http://www.omg.org/spec/DD/ 20100524/DC",
            "xmlns:di": "http://www.omg.org/spec/DD/20100524/DI",
            "id": "Definitio ns_1",
            "targetNamespace": "http://sample.bpmn2.org/bpmn2/sample/process"
        },
        "bpmn2:m essage": [
            {
                "$": {
                    "id": "Message_1",
                    "name": "Message 1"
                }
            },
            {
                "$": {
                    "id": "Message_2",
                    "nam e": "Message 2"
                }
            }
        ],
        "bpmn2:interface": [
            {
                "$": {
                    "id": "Interface_1",
                    "name": "Interface 1"
                },
                "bpmn2:operation": [
                    {
                        "$": {
                            "id": "Operation_1",
                            "name": "Operation 1"
                        }
                    }
                ]
            }
        ],
        "proce ss": [
            {
                "$": {
                    "processType": "public",
                    "isExecutable": "true",
                    "id": "BPMNDiagram_1",
                    "na me": "BPMN2"
                },
                "bpmn2:process": [
                    {
                        "$": {
                            "id": "process_1",
                            "name": "Default Process"
                        },
                        " bpmn2:laneSet": [
                            {
                                "$": {
                                    "id": "LaneSet_1",
                                    "name": "Lane Set 1"
                                },
                                "bpmn2:lane": [
                                    {
                                        "$": {
                                            "id": "Lane_1",
                                            "name": "StakeHolder1"
                                        },
                                        "bpmn2:flowNodeRef": [
                                            "Task_1",
                                            "InclusiveGat eway_1",
                                            "Task_2"
                                        ]
                                    },
                                    {
                                        "$": {
                                            "id": "Lane_2",
                                            "name": "StakeHolder2"
                                        },
                                        "bpmn2:flowNodeRef ": [
                                            "Task_3",
                                            "EndEvent_1",
                                            "StartEvent_1"
                                        ]
                                    }
                                ]
                            }
                        ],
                        "bpmn2:task": [
                            {
                                "$": {
                                    "id": "Task_3",
                                    " name": "Task 3"
                                },
                                "bpmn2:incoming": [
                                    "SequenceFlow_13"
                                ],
                                "bpmn2:outgoing": [
                                    "Sequence Flow_14"
                                ]
                            },
                            {
                                "$": {
                                    "id": "Task_1",
                                    "name": "Task 1"
                                },
                                "bpmn2:incoming": [
                                    "SequenceFlow_ 1"
                                ],
                                "bpmn2:outgoing": [
                                    "SequenceFlow_12"
                                ]
                            },
                            {
                                "$": {
                                    "id": "Task_2",
                                    "name": "Task 2"
                                },
                                " bpmn2:incoming": [
                                    "SequenceFlow_2"
                                ],
                                "bpmn2:outgoing": [
                                    "SequenceFlow_3"
                                ]
                            }
                        ],
                        "bpmn2: endEvent": [
                            {
                                "$": {
                                    "id": "EndEvent_1"
                                },
                                "bpmn2:incoming": [
                                    "SequenceFlow_14",
                                    "Sequenc eFlow_3"
                                ]
                            }
                        ],
                        "bpmn2:sequenceFlow": [
                            {
                                "$": {
                                    "id": "SequenceFlow_14",
                                    "sourceRef": "Task _3",
                                    "targetRef": "EndEvent_1"
                                }
                            },
                            {
                                "$": {
                                    "id": "SequenceFlow_1",
                                    "sourceRef": "StartEve nt_1",
                                    "targetRef": "Task_1"
                                }
                            },
                            {
                                "$": {
                                    "id": "SequenceFlow_12",
                                    "sourceRef": "Task_1",
                                    " targetRef": "InclusiveGateway_1"
                                }
                            },
                            {
                                "$": {
                                    "id": "SequenceFlow_13",
                                    "sourceRef": "Incl usiveGateway_1",
                                    "targetRef": "Task_3"
                                }
                            },
                            {
                                "$": {
                                    "id": "SequenceFlow_2",
                                    "sourceRef": " InclusiveGateway_1",
                                    "targetRef": "Task_2"
                                }
                            },
                            {
                                "$": {
                                    "id": "SequenceFlow_3",
                                    "sourceRe f": "Task_2",
                                    "targetRef": "EndEvent_1"
                                }
                            }
                        ],
                        "bpmn2:startEvent": [
                            {
                                "$": {
                                    "id": "StartEve nt_1"
                                },
                                "bpmn2:outgoing": [
                                    "SequenceFlow_1"
                                ]
                            }
                        ],
                        "bpmn2:inclusiveGateway": [
                            {
                                "$": {
                                    "id ": "InclusiveGateway_1",
                                    "name": "Inclusive Gateway 1"
                                },
                                "bpmn2:incoming": [
                                    "Sequence Flow_12"
                                ],
                                "bpmn2:outgoing": [
                                    "SequenceFlow_13",
                                    "SequenceFlow_2"
                                ]
                            }
                        ]
                    }
                ],
                "bpmndi:BPMN Diagram": [
                    {
                        "$": {
                            "id": "BPMNDiagram_1",
                            "name": "Default Process Diagram"
                        },
                        "bpmndi:B PMNPlane": [
                            {
                                "$": {
                                    "id": "BPMNPlane_1",
                                    "bpmnElement": "process_1"
                                },
                                "bpmndi:BPMNShape ": [
                                    {
                                        "$": {
                                            "id": "BPMNShape_Lane_1",
                                            "bpmnElement": "Lane_1",
                                            "isHorizontal": "true"
                                        },
                                        " dc:Bounds": [
                                            {
                                                "$": {
                                                    "height": "115.0",
                                                    "width": "600.0",
                                                    "x": "100.0",
                                                    "y": "136.0"
                                                }
                                            }
                                        ]
                                    },
                                    {
                                        "$": {
                                            "id": "BPMNShape_Lane_2",
                                            "bpmnElement": "Lane_2",
                                            "isHorizontal": "true"
                                        },
                                        "dc:B ounds": [
                                            {
                                                "$": {
                                                    "height": "111.0",
                                                    "width": "600.0",
                                                    "x": "100.0",
                                                    "y": "250.0"
                                                }
                                            }
                                        ]
                                    },
                                    {
                                        "$": {
                                            "id": "BPMNShape_1",
                                            "bpmnElement": "StartEvent_1"
                                        },
                                        "dc:Bounds": [
                                            {
                                                "$": {
                                                    "height": "3 6.0",
                                                    "width": "36.0",
                                                    "x": "140.0",
                                                    "y": "281.0"
                                                }
                                            }
                                        ]
                                    },
                                    {
                                        "$": {
                                            "id": "BPMNShape_2",
                                            "bpmnEl ement": "EndEvent_1"
                                        },
                                        "dc:Bounds": [
                                            {
                                                "$": {
                                                    "height": "36.0",
                                                    "width": "36.0",
                                                    "x": "620. 0",
                                                    "y": "288.0"
                                                }
                                            }
                                        ]
                                    },
                                    {
                                        "$": {
                                            "id": "BPMNShape_InclusiveGateway_1",
                                            "bpmnElement": "Incl usiveGateway_1"
                                        },
                                        "dc:Bounds": [
                                            {
                                                "$": {
                                                    "height": "50.0",
                                                    "width": "50.0",
                                                    "x": "361.0",
                                                    " y": "169.0"
                                                }
                                            }
                                        ]
                                    },
                                    {
                                        "$": {
                                            "id": "BPMNShape_Task_3",
                                            "bpmnElement": "Task_3"
                                        },
                                        "dc:Bounds": [
                                            {
                                                "$": {
                                                    "height": "50.0",
                                                    "width": "110.0",
                                                    "x": "330.0",
                                                    "y": "281.0"
                                                }
                                            }
                                        ]
                                    },
                                    {
                                        "$": {
                                            "id": " BPMNShape_Task_1",
                                            "bpmnElement": "Task_1"
                                        },
                                        "dc:Bounds": [
                                            {
                                                "$": {
                                                    "height": "50.0",
                                                    "wi dth": "110.0",
                                                    "x": "160.0",
                                                    "y": "169.0"
                                                }
                                            }
                                        ]
                                    },
                                    {
                                        "$": {
                                            "id": "BPMNShape_Task_2",
                                            "bpmnElem ent": "Task_2"
                                        },
                                        "dc:Bounds": [
                                            {
                                                "$": {
                                                    "height": "50.0",
                                                    "width": "110.0",
                                                    "x": "520.0",
                                                    "y ": "169.0"
                                                }
                                            }
                                        ]
                                    }
                                ],
                                "bpmndi:BPMNEdge": [
                                    {
                                        "$": {
                                            "id": "BPMNEdge_SequenceFlow_1",
                                            "bpmnElem ent": "SequenceFlow_1",
                                            "sourceElement": "BPMNShape_1",
                                            "targetElement": "BPMNShape_T ask_1"
                                        },
                                        "di:waypoint": [
                                            {
                                                "$": {
                                                    "xsi:type": "dc:Point",
                                                    "x": "176.0",
                                                    "y": "299.0"
                                                }
                                            },
                                            {
                                                "$ ": {
                                                    "xsi:type": "dc:Point",
                                                    "x": "215.0",
                                                    "y": "299.0"
                                                }
                                            },
                                            {
                                                "$": {
                                                    "xsi:type": "dc:Point",
                                                    " x": "215.0",
                                                    "y": "219.0"
                                                }
                                            }
                                        ]
                                    },
                                    {
                                        "$": {
                                            "id": "BPMNEdge_SequenceFlow_12",
                                            "bpmnElement": " SequenceFlow_12",
                                            "sourceElement": "BPMNShape_Task_1",
                                            "targetElement": "BPMNShape_I nclusiveGateway_1"
                                        },
                                        "di:waypoint": [
                                            {
                                                "$": {
                                                    "xsi:type": "dc:Point",
                                                    "x": "270.0",
                                                    "y": " 194.0"
                                                }
                                            },
                                            {
                                                "$": {
                                                    "xsi:type": "dc:Point",
                                                    "x": "310.0",
                                                    "y": "194.0"
                                                }
                                            },
                                            {
                                                "$": {
                                                    "xsi:type": "dc:Point",
                                                    "x": "310.0",
                                                    "y": "194.0"
                                                }
                                            },
                                            {
                                                "$": {
                                                    "xsi:type": "dc:Point",
                                                    "x": "361.0",
                                                    "y": "194.0"
                                                }
                                            }
                                        ]
                                    },
                                    {
                                        "$": {
                                            "id": "BPMNEdge_SequenceFlow_13",
                                            "bpmnElement": "SequenceFlow_1 3",
                                            "sourceElement": "BPMNShape_InclusiveGateway_1",
                                            "targetElement": "BPMNShape_Tas k_3"
                                        },
                                        "di:waypoint": [
                                            {
                                                "$": {
                                                    "xsi:type": "dc:Point",
                                                    "x": "386.0",
                                                    "y": "220.0"
                                                }
                                            },
                                            {
                                                "$": {
                                                    "xsi:type": "dc:Point",
                                                    "x": "386.0",
                                                    "y": "247.0"
                                                }
                                            },
                                            {
                                                "$": {
                                                    "xsi:type": "dc:Point",
                                                    "x": "385.0",
                                                    "y": "247.0"
                                                }
                                            },
                                            {
                                                "$": {
                                                    "xsi:type": "dc:Point",
                                                    "x": "385.0",
                                                    "y": "281.0"
                                                }
                                            }
                                        ]
                                    },
                                    {
                                        "$": {
                                            "id": "BPMNEdge_SequenceFlow_14",
                                            "bpmnElement": "SequenceFlow_14",
                                            "sourceElem ent": "BPMNShape_Task_3",
                                            "targetElement": "BPMNShape_2"
                                        },
                                        "di:waypoint": [
                                            {
                                                "$": {
                                                    "xsi :type": "dc:Point",
                                                    "x": "440.0",
                                                    "y": "306.0"
                                                }
                                            },
                                            {
                                                "$": {
                                                    "xsi:type": "dc:Point",
                                                    "x": "521 .0",
                                                    "y": "306.0"
                                                }
                                            },
                                            {
                                                "$": {
                                                    "xsi:type": "dc:Point",
                                                    "x": "521.0",
                                                    "y": "306.0"
                                                }
                                            },
                                            {
                                                "$": {
                                                    "x si:type": "dc:Point",
                                                    "x": "620.0",
                                                    "y": "306.0"
                                                }
                                            }
                                        ]
                                    },
                                    {
                                        "$": {
                                            "id": "BPMNEdge_SequenceFlo w_2",
                                            "bpmnElement": "SequenceFlow_2",
                                            "sourceElement": "BPMNShape_InclusiveGateway_ 1",
                                            "targetElement": "BPMNShape_Task_2"
                                        },
                                        "di:waypoint": [
                                            {
                                                "$": {
                                                    "xsi:type": "dc:Point ",
                                                    "x": "412.0",
                                                    "y": "194.0"
                                                }
                                            },
                                            {
                                                "$": {
                                                    "xsi:type": "dc:Point",
                                                    "x": "460.0",
                                                    "y": "194.0"
                                                }
                                            },
                                            {
                                                "$": {
                                                    "xsi:type": "dc:Point",
                                                    "x": "460.0",
                                                    "y": "194.0"
                                                }
                                            },
                                            {
                                                "$": {
                                                    "xsi:type": "dc:Poi nt",
                                                    "x": "520.0",
                                                    "y": "194.0"
                                                }
                                            }
                                        ]
                                    },
                                    {
                                        "$": {
                                            "id": "BPMNEdge_SequenceFlow_3",
                                            "bpmnElemen t": "SequenceFlow_3",
                                            "sourceElement": "BPMNShape_Task_2",
                                            "targetElement": "BPMNShap e_2"
                                        },
                                        "di:waypoint": [
                                            {
                                                "$": {
                                                    "xsi:type": "dc:Point",
                                                    "x": "630.0",
                                                    "y": "194.0"
                                                }
                                            },
                                            {
                                                "$": {
                                                    "xsi:type": "dc:Point",
                                                    "x": "638.0",
                                                    "y": "194.0"
                                                }
                                            },
                                            {
                                                "$": {
                                                    "xsi:type": "dc:Point",
                                                    "x": "638.0",
                                                    "y": "288.0"
                                                }
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    }
}