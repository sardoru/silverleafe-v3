import React, { useState, useRef, useEffect } from 'react';
import Map, { Source, Layer, Marker, Popup } from 'react-map-gl';
import { easeCubic } from 'd3-ease';
import { Search, Share2, MapPin, Box, FileText, Clock, ChevronDown, ChevronUp, FileCheck, Droplets, Sprout, Sun, Thermometer, Wind, QrCode, Shield, CheckCircle2, Verified, ScanLine, Send, FileSignature, ChevronRight, ChevronLeft, Tractor, User, Ruler, Calendar, Hash, Scale, Microscope, Ruler as Ruler2, Leaf } from 'lucide-react';
import AttestationModal from './AttestationModal';
import type { AttestationData } from './AttestationModal';
import { useBatchStore } from '../store';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = 'pk.eyJ1IjoiZXhjaGFuZ2VzdWl0ZXMiLCJhIjoiY2lsOHR6ZHo3MGZjanY0bTJsZGtvMWp3biJ9.go5xYjE4ye3W1aDEGeeeOw';

const SUPPLY_CHAIN_STAGES = [
  {
    id: 'cotton-farm',
    name: 'Cotton Farm',
    type: 'farm',
    coordinates: [-88.501273, 33.403577],
    status: 'completed',
    description: 'Organic cotton cultivation using sustainable farming practices',
    details: {
      client: {
        name: 'Cotton Industries LLC',
        farm: 'Sunshine Organic Farms',
        field: 'North Field A12'
      },
      equipment: {
        harvester: {
          model: 'John Deere CP690',
          id: '1N0C690PLK4075382'
        },
        operator: {
          name: 'Joel Johnson',
          id: 'OP-001'
        },
        cottonVariety: 'DP 2211 B3TXF TR'
      },
      location: {
        latitude: 33.400444,
        longitude: -88.509750,
        gmtDateTime: '2024-10-16T15:30:00Z',
        fieldArea: {
          value: 512.7,
          unit: 'acres'
        }
      },
      moduleId: '23410387436',
      bales: [
        {
          baleNo: '1112844',
          weight: 471,
          micronaire: 4.7,
          strength: 29.8,
          length: 1.15
        },
        {
          baleNo: '1112845',
          weight: 483,
          micronaire: 4.7,
          strength: 29.8,
          length: 1.15
        },
        {
          baleNo: '1112842',
          weight: 471,
          micronaire: 4.7,
          strength: 29.8,
          length: 1.15
        },
        {
          baleNo: '1112843',
          weight: 487,
          micronaire: 4.7,
          strength: 29.8,
          length: 1.15
        }
      ]
    }
  },
  {
    id: 'ginning-facility',
    name: 'Ginning Facility',
    type: 'gin',
    coordinates: [-88.46489, 33.215075],
    status: 'in_progress',
    description: 'Cotton fiber separation and quality control',
    details: {
      location: 'Local Ginning Facility',
      capacity: '50 tons per day',
      processes: ['Fiber Separation', 'Cleaning', 'Quality Grading'],
      certifications: ['ISO 9001:2015', 'GOTS'],
      metrics: {
        efficiency: '95%',
        fiberQuality: 'Premium Grade',
        wastage: '<2%'
      },
      equipment: [
        'Modern Ginning Machines',
        'Automated Sorting System',
        'Quality Testing Lab'
      ]
    }
  },
  {
    id: 'spinning-mill',
    name: 'Yarn Spinning Mill',
    type: 'spinner',
    coordinates: [68.0151, 40.1350],
    status: 'scheduled',
    description: 'Converting cotton fibers into high-quality yarn',
    details: {
      location: 'Jizzakh Industrial Park',
      capacity: '30 tons per day',
      products: ['Fine Count Yarns', 'Medium Count Yarns', 'Specialty Blends'],
      certifications: ['ISO 9001:2015', 'Oeko-Tex Standard 100'],
      metrics: {
        yarnStrength: '28-32 g/tex',
        uniformity: '85%+',
        efficiency: '92%'
      },
      equipment: [
        'Ring Spinning Frames',
        'Roving Frames',
        'Quality Testing Equipment'
      ]
    }
  },
  {
    id: 'weaving-facility',
    name: 'Weaving Facility',
    type: 'weaver',
    coordinates: [73.0479, 31.4504],
    status: 'scheduled',
    description: 'Transforming yarn into premium fabric',
    details: {
      location: '243 RB Sumundri Road, Faisalabad, Faisalabad, 38000, Pakistan',
      capacity: '25,000 meters per day',
      products: ['Denim', 'Shirting', 'Technical Fabrics'],
      certifications: ['ISO 14001:2015', 'SA8000'],
      metrics: {
        fabricQuality: 'Premium Grade',
        efficiency: '90%',
        wastage: '<3%'
      },
      equipment: [
        'Air Jet Looms',
        'Rapier Looms',
        'Fabric Inspection Systems'
      ]
    }
  },
  {
    id: 'textile-mill',
    name: 'Textile Mill',
    type: 'textile',
    coordinates: [90.4125, 23.7937],
    status: 'scheduled',
    description: 'Final textile production and finishing',
    details: {
      location: '387, TML Building, Tejgaon, Dhaka, Bangladesh',
      capacity: '20,000 pieces per day',
      processes: ['Dyeing', 'Printing', 'Finishing'],
      certifications: ['ISO 9001:2015', 'GOTS', 'Fair Trade'],
      metrics: {
        qualityRating: '98%',
        sustainability: 'Zero Discharge',
        efficiency: '88%'
      },
      equipment: [
        'Digital Printing Machines',
        'Eco-friendly Dyeing Units',
        'Automated Cutting Systems'
      ]
    }
  }
];

const JOURNEY_CONNECTIONS = {
  type: 'FeatureCollection',
  features: SUPPLY_CHAIN_STAGES.slice(0, -1).map((stage, index) => ({
    type: 'Feature',
    properties: { 
      status: stage.status,
      fromId: stage.id,
      toId: SUPPLY_CHAIN_STAGES[index + 1].id
    },
    geometry: {
      type: 'LineString',
      coordinates: [
        stage.coordinates,
        SUPPLY_CHAIN_STAGES[index + 1].coordinates
      ]
    }
  }))
};

const journeyConnectionLayer = {
  id: 'journey-connection',
  type: 'line',
  paint: {
    'line-color': [
      'match',
      ['get', 'status'],
      'completed', '#059669',
      'in_progress', '#3B82F6',
      '#9CA3AF'
    ],
    'line-width': 2,
    'line-dasharray': [2, 2]
  }
};

const journeyConnectionGlowLayer = {
  id: 'journey-connection-glow',
  type: 'line',
  paint: {
    'line-color': [
      'match',
      ['get', 'status'],
      'completed', '#10B981',
      'in_progress', '#60A5FA',
      '#D1D5DB'
    ],
    'line-width': 4,
    'line-opacity': 0.3
  }
};

const FARM_POLYGON = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        name: 'Cotton Farm Area'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-88.501273, 33.403577],
          [-88.501114, 33.397066],
          [-88.496758, 33.397052],
          [-88.496682, 33.389816],
          [-88.497082, 33.386353],
          [-88.503556, 33.384386],
          [-88.509682, 33.385228],
          [-88.509815, 33.397101],
          [-88.509545, 33.397809],
          [-88.509637, 33.398189],
          [-88.509811, 33.402923],
          [-88.501273, 33.403577]
        ]]
      }
    }
  ]
};

const farmPolygonLayer = {
  id: 'farm-polygon',
  type: 'fill',
  paint: {
    'fill-color': '#3B82F6',
    'fill-opacity': 0.5
  }
};

const farmPolygonOutlineLayer = {
  id: 'farm-polygon-outline',
  type: 'line',
  paint: {
    'line-color': '#2563EB',
    'line-width': 2
  }
};

export default function SupplyChain() {
  const mapRef = useRef<any>(null);
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [isAttestationModalOpen, setIsAttestationModalOpen] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const rotationRef = useRef<number>(0);
  const animationFrameRef = useRef<number>();
  const [viewState, setViewState] = useState({
    longitude: -88.501273,
    latitude: 33.403577,
    zoom: 12,
    bearing: 0,
    pitch: 60
  });

  useEffect(() => {
    const cottonFarmStage = SUPPLY_CHAIN_STAGES[0];
    setSelectedStage(cottonFarmStage.id);
    
    setTimeout(() => {
      startRotationAnimation(cottonFarmStage.coordinates);
    }, 1000);
  }, []);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const startRotationAnimation = (coordinates: [number, number]) => {
    if (isRotating) return;
    
    setIsRotating(true);
    rotationRef.current = viewState.bearing;
    
    const startTime = Date.now();
    const duration = 30000;
    
    const animate = () => {
      const currentTime = Date.now();
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const newBearing = progress * 360;
      
      setViewState(prev => ({
        ...prev,
        bearing: newBearing
      }));
      
      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        setIsRotating(false);
      }
    };
    
    animationFrameRef.current = requestAnimationFrame(animate);
  };

  const handleStageClick = (stageId: string) => {
    const stage = SUPPLY_CHAIN_STAGES.find(s => s.id === stageId);
    if (!stage) return;

    setSelectedStage(stageId);
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      setIsRotating(false);
    }

    setViewState(prev => ({
      ...prev,
      bearing: 0
    }));

    if (mapRef.current) {
      mapRef.current.getMap().flyTo({
        center: stage.coordinates,
        zoom: 12,
        duration: 2000,
        pitch: 60,
        bearing: 0,
        essential: true,
        easing: easeCubic
      });

      if (stageId === 'cotton-farm') {
        setTimeout(() => {
          startRotationAnimation(stage.coordinates);
        }, 2000);
      }
    }
  };

  const handleTransfer = (stageId: string) => {
    console.log('Transfer initiated for stage:', stageId);
  };

  const handleAttestation = (stageId: string) => {
    setIsAttestationModalOpen(true);
  };

  const handleAttestationSubmit = (data: AttestationData) => {
    console.log('Attestation data:', data);
  };

  const getStageIcon = (type: string) => {
    switch (type) {
      case 'farm':
        return <Sprout className="h-5 w-5 text-green-600" />;
      case 'gin':
        return <Shield className="h-5 w-5 text-blue-600" />;
      case 'spinner':
        return <Box className="h-5 w-5 text-purple-600" />;
      case 'weaver':
        return <QrCode className="h-5 w-5 text-orange-600" />;
      case 'textile':
        return <Verified className="h-5 w-5 text-red-600" />;
      default:
        return <Box className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Completed
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Clock className="h-3 w-3 mr-1" />
            In Progress
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <Clock className="h-3 w-3 mr-1" />
            Scheduled
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col space-y-4 mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Supply Chain Map</h2>
            
            <div className="relative">
              <div className="overflow-x-auto -mx-6 px-6">
                <div className="flex items-center gap-3 pb-2 min-w-max">
                  {SUPPLY_CHAIN_STAGES.map((stage, index) => (
                    <button
                      key={stage.id}
                      onClick={() => handleStageClick(stage.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors duration-150 ${
                        selectedStage === stage.id
                          ? 'bg-green-50 text-green-700'
                          : 'bg-white text-gray-600 hover:bg-gray-50'
                      } shadow-sm border border-gray-100`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-medium text-gray-600">{index + 1}</span>
                        </div>
                        {getStageIcon(stage.type)}
                        <span className="text-sm whitespace-nowrap">{stage.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="absolute left-0 top-0 bottom-2 w-8 bg-gradient-to-r from-white to-transparent pointer-events-none md:hidden" />
              <div className="absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none md:hidden" />
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-gray-500 md:hidden">
              <ChevronLeft className="h-4 w-4" />
              Scroll to see more stages
              <ChevronRight className="h-4 w-4" />
            </div>
          </div>

          <div className="h-[500px] rounded-lg overflow-hidden relative">
            <Map
              ref={mapRef}
              {...viewState}
              onMove={evt => setViewState(evt.viewState)}
              mapboxAccessToken={MAPBOX_TOKEN}
              mapStyle="mapbox://styles/mapbox/satellite-v9"
              interactive={true}
            >
              <Source type="geojson" data={JOURNEY_CONNECTIONS}>
                <Layer {...journeyConnectionGlowLayer} />
                <Layer {...journeyConnectionLayer} />
              </Source>

              <Source type="geojson" data={FARM_POLYGON}>
                <Layer {...farmPolygonLayer} />
                <Layer {...farmPolygonOutlineLayer} />
              </Source>

              {SUPPLY_CHAIN_STAGES.map((stage, index) => (
                <Marker
                  key={stage.id}
                  longitude={stage.coordinates[0]}
                  latitude={stage.coordinates[1]}
                  anchor="bottom"
                >
                  <button
                    onClick={() => handleStageClick(stage.id)}
                    className="relative group"
                  >
                    <div className={`p-3 rounded-lg shadow-lg transition-all duration-200 ${
                      selectedStage === stage.id ? 'scale-110' : 'group-hover:scale-110'
                    } ${
                      stage.status === 'completed' ? 'bg-green-50' :
                      stage.status === 'in_progress' ? 'bg-blue-50' :
                      'bg-gray-50'
                    }`}>
                      {getStageIcon(stage.type)}
                    </div>
                    
                    <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-white shadow-md flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-700">{index + 1}</span>
                    </div>

                    <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2">
                      <div className="px-2 py-1 bg-white rounded shadow-md text-xs font-medium text-gray-700 whitespace-nowrap">
                        {stage.name}
                      </div>
                    </div>
                  </button>
                </Marker>
              ))}
            </Map>
          </div>
        </div>
      </div>

      {selectedStage && (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6">
            {SUPPLY_CHAIN_STAGES.map(stage => stage.id === selectedStage && (
              <div key={stage.id} className="space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      {getStageIcon(stage.type)}
                      <h3 className="text-xl font-semibold text-gray-900">{stage.name}</h3>
                      {getStatusBadge(stage.status)}
                    </div>
                    <p className="text-gray-600">{stage.description}</p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleAttestation(stage.id)}
                      className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors duration-150 font-medium"
                    >
                      <FileSignature className="h-4 w-4 mr-2" />
                      Append Attestation
                    </button>
                    <button
                      onClick={() => handleTransfer(stage.id)}
                      className="inline-flex items-center px-4 py-2 rounded-lg border-2 border-green-600 text-green-600 hover:bg-green-50 transition-colors duration-150 font-medium"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Transfer
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {stage.id === 'cotton-farm' ? (
                    <>
                      <div className="space-y-4">
                        <h4 className="text-lg font-medium text-gray-900">Client Information</h4>
                        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                          <div>
                            <label className="text-sm font-medium text-gray-700">Client</label>
                            <p className="text-sm text-gray-900">{stage.details.client.name}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700">Farm</label>
                            <p className="text-sm text-gray-900">{stage.details.client.farm}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700">Field</label>
                            <p className="text-sm text-gray-900">{stage.details.client.field}</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-lg font-medium text-gray-900">Equipment Information</h4>
                        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                          <div>
                            <label className="text-sm font-medium text-gray-700">Harvester</label>
                            <p className="text-sm text-gray-900">
                              {stage.details.equipment.harvester.model} (ID: {stage.details.equipment.harvester.id})
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700">Operator</label>
                            <p className="text-sm text-gray-900">
                              {stage.details.equipment.operator.name} (ID: {stage.details.equipment.operator.id})
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700">Cotton Variety</label>
                            <p className="text-sm text-gray-900">{stage.details.equipment.cottonVariety}</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-lg font-medium text-gray-900">Location & Field Data</h4>
                        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                          <div>
                            <label className="text-sm font-medium text-gray-700">Geolocation</label>
                            <p className="text-sm text-gray-900">
                              Latitude: {stage.details.location.latitude}°<br />
                              Longitude: {stage.details.location.longitude}°
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700">GMT Date & Time</label>
                            <p className="text-sm text-gray-900">
                              {new Date(stage.details.location.gmtDateTime).toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700">Field Area</label>
                            <p className="text-sm text-gray-900">
                              {stage.details.location.fieldArea.value} {stage.details.location.fieldArea.unit}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-lg font-medium text-gray-900">
                          Bales from Module ID: {stage.details.moduleId}
                        </h4>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead>
                                <tr>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Bale No</th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Weight (lbs)</th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Micronaire</th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Strength</th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Length</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200">
                                {stage.details.bales.map((bale) => (
                                  <tr key={bale.baleNo}>
                                    <td className="px-4 py-2 text-sm font-medium text-blue-600">{bale.baleNo}</td>
                                    <td className="px-4 py-2 text-sm text-gray-500">{bale.weight}</td>
                                    <td className="px-4 py-2 text-sm text-gray-500">{bale.micronaire}</td>
                                    <td className="px-4 py-2 text-sm text-gray-500">{bale.strength}</td>
                                    <td className="px-4 py-2 text-sm text-gray-500">{bale.length}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-4">
                        <h4 className="text-lg font-medium text-gray-900">Facility Information</h4>
                        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                          <div>
                            <label className="text-sm font-medium text-gray-700">Location</label>
                            <p className="text-sm text-gray-900">{stage.details.location}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700">Capacity</label>
                            <p className="text-sm text-gray-900">{stage.details.capacity}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700">Certifications</label>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {stage.details.certifications.map((cert, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                >
                                  <FileCheck className="h-3 w-3 mr-1" />
                                  {cert}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-lg font-medium text-gray-900">Performance Metrics</h4>
                        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                          {Object.entries(stage.details.metrics).map(([key, value], index) => (
                            <div key={key}>
                              <label className="text-sm font-medium text-gray-700">
                                {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                              </label>
                              <p className="text-sm text-gray-900">{value}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="col-span-2 space-y-4">
                        <h4 className="text-lg font-medium text-gray-900">Equipment & Technology</h4>
                        <div className="grid grid-cols-3 gap-4">
                          {stage.details.equipment.map((item, index) => (
                            <div
                              key={index}
                              className="bg-gray-50 rounded-lg p-4 flex items-center gap-3"
                            >
                              <Shield className="h-5 w-5 text-gray-400" />
                              <span className="text-sm text-gray-900">{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <AttestationModal
        isOpen={isAttestationModalOpen}
        onClose={() => setIsAttestationModalOpen(false)}
        onSubmit={handleAttestationSubmit}
        stageId={selectedStage || ''}
      />
    </div>
  );
}