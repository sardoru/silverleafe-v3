import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import Map, { Source, Layer, Marker } from 'react-map-gl';
import { 
  ArrowLeft, Calendar, MapPin, Package, FileText, Truck, Shield, Leaf,
  Droplet, Download, ExternalLink, Layers, User, Clock, CheckCircle,
  XCircle, AlertTriangle, Info, History, Link as LinkIcon, Factory,
  Scale, Aperture as Moisture, FileSpreadsheet, Tractor, Ruler,
  Microscope
} from 'lucide-react';
import { useBatchStore } from '../store';
import { CottonBatch, CustodyEvent } from '../types';
import { generateCertificatePdf, downloadDocumentAsPdf } from '../utils/pdfUtils';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = 'pk.eyJ1IjoiZXhjaGFuZ2VzdWl0ZXMiLCJhIjoiY2lsOHR6ZHo3MGZjanY0bTJsZGtvMWp3biJ9.go5xYjE4ye3W1aDEGeeeOw';

// Mock yield data for heatmap visualization
const YIELD_DATA = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { yield: 95 },
      geometry: {
        type: 'Point',
        coordinates: [-88.501273, 33.403577]
      }
    },
    {
      type: 'Feature',
      properties: { yield: 85 },
      geometry: {
        type: 'Point',
        coordinates: [-88.501114, 33.397066]
      }
    },
    {
      type: 'Feature',
      properties: { yield: 90 },
      geometry: {
        type: 'Point',
        coordinates: [-88.496758, 33.397052]
      }
    },
    {
      type: 'Feature',
      properties: { yield: 75 },
      geometry: {
        type: 'Point',
        coordinates: [-88.496682, 33.389816]
      }
    }
  ]
};

const heatmapLayer = {
  id: 'yield-heatmap',
  type: 'heatmap',
  paint: {
    'heatmap-weight': ['interpolate', ['linear'], ['get', 'yield'], 0, 0, 100, 1],
    'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1, 9, 3],
    'heatmap-color': [
      'interpolate',
      ['linear'],
      ['heatmap-density'],
      0, 'rgba(33,102,172,0)',
      0.2, 'rgb(103,169,207)',
      0.4, 'rgb(209,229,240)',
      0.6, 'rgb(253,219,199)',
      0.8, 'rgb(239,138,98)',
      1, 'rgb(178,24,43)'
    ],
    'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 2, 9, 20],
    'heatmap-opacity': 0.7
  }
};

const farmBoundaryLayer = {
  id: 'farm-boundary',
  type: 'line',
  paint: {
    'line-color': '#10b981',
    'line-width': 2
  }
};

// Farm polygon data
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

const BatchDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { batches, selectedBatch, selectBatch } = useBatchStore();
  const [activeTab, setActiveTab] = useState<'equipment' | 'gin'>('equipment');
  const [viewState, setViewState] = useState({
    longitude: -88.501273,
    latitude: 33.403577,
    zoom: 14,
    bearing: 0,
    pitch: 45
  });
  
  useEffect(() => {
    if (id) {
      selectBatch(id);
    }
  }, [id, selectBatch, batches]);

  const handleCertificateDownload = async (cert: any) => {
    if (!selectedBatch) return;
    
    try {
      if (cert.documentUrl) {
        await downloadDocumentAsPdf(
          cert.documentUrl, 
          `${cert.id}_documentation.pdf`
        );
      } else {
        await generateCertificatePdf(cert, selectedBatch.id, selectedBatch.farmName);
      }
    } catch (error) {
      console.error("Error handling certificate download:", error);
      alert("There was an error generating the certificate. Please try again.");
    }
  };

  const handleDocumentDownload = async (doc: string, index: number) => {
    try {
      await downloadDocumentAsPdf(doc, `transport_document_${index + 1}.pdf`);
    } catch (error) {
      console.error("Error downloading document:", error);
      alert("There was an error downloading the document. Please try again.");
    }
  };

  if (!selectedBatch) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center">
        <Link to="/batches" className="mr-4 p-2 rounded-full hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Harvest {selectedBatch.id}</h1>
          <p className="mt-1 text-sm text-gray-500">
            Harvested on {new Date(selectedBatch.harvestDate).toLocaleDateString()} by {selectedBatch.farmName}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          {/* Tabs */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex" aria-label="Tabs">
                <button
                  onClick={() => setActiveTab('equipment')}
                  className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                    activeTab === 'equipment'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Tractor className="h-5 w-5 mb-1 mx-auto" />
                  Equipment & Harvest Data
                </button>
                <button
                  onClick={() => setActiveTab('gin')}
                  className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                    activeTab === 'gin'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Factory className="h-5 w-5 mb-1 mx-auto" />
                  Gin Data
                </button>
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'equipment' ? (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Client Information</h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Client</label>
                        <p className="text-sm text-gray-900">{selectedBatch.equipmentData.clientName}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Farm</label>
                        <p className="text-sm text-gray-900">{selectedBatch.equipmentData.farmName}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Field</label>
                        <p className="text-sm text-gray-900">{selectedBatch.equipmentData.fieldName}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Equipment Information</h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Harvester</label>
                        <p className="text-sm text-gray-900">
                          {selectedBatch.equipmentData.harvesterModel} (ID: {selectedBatch.equipmentData.harvesterId})
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Operator</label>
                        <p className="text-sm text-gray-900">
                          {selectedBatch.equipmentData.operatorName} (ID: {selectedBatch.equipmentData.operatorId})
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Cotton Variety</label>
                        <p className="text-sm text-gray-900">{selectedBatch.equipmentData.cottonVariety}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Location & Field Data</h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Geolocation</label>
                        <p className="text-sm text-gray-900">
                          Latitude: {selectedBatch.equipmentData.location.latitude}°<br />
                          Longitude: {selectedBatch.equipmentData.location.longitude}°
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">GMT Date & Time</label>
                        <p className="text-sm text-gray-900">
                          {new Date(selectedBatch.equipmentData.gmtDateTime).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Field Area</label>
                        <p className="text-sm text-gray-900">
                          {selectedBatch.equipmentData.fieldArea.value} {selectedBatch.equipmentData.fieldArea.unit}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Bales from Module ID: {selectedBatch.equipmentData.moduleId}
                    </h3>
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
                            {selectedBatch.equipmentData.bales.map((bale) => (
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
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Gin Processing Information</h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Gin Facility</label>
                        <p className="text-sm text-gray-900">{selectedBatch.ginData.facilityName} (ID: {selectedBatch.ginData.ginId})</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700">Entry Date</label>
                          <p className="text-sm text-gray-900">{new Date(selectedBatch.ginData.entryDate).toLocaleString()}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Exit Date</label>
                          <p className="text-sm text-gray-900">{new Date(selectedBatch.ginData.exitDate).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Production Details</h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Fiber Bale Production</label>
                        <p className="text-sm text-gray-900">
                          {new Date(selectedBatch.ginData.productionDetails.fiberBaleProductionDate).toLocaleString()}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700">Fiber Bale ID</label>
                          <p className="text-sm text-gray-900">{selectedBatch.ginData.productionDetails.fiberBaleId}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Bale Weight</label>
                          <p className="text-sm text-gray-900">{selectedBatch.ginData.productionDetails.baleWeight} lbs</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700">Module Weight</label>
                          <p className="text-sm text-gray-900">{selectedBatch.ginData.productionDetails.moduleWeight} lbs</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Field Total Cotton</label>
                          <p className="text-sm text-gray-900">{selectedBatch.ginData.productionDetails.fieldTotalCotton} bales</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Quality Metrics</h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700">Moisture Content</label>
                          <p className="text-sm text-gray-900">{selectedBatch.ginData.qualityMetrics.moistureContent}%</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Trash Content</label>
                          <p className="text-sm text-gray-900">{selectedBatch.ginData.qualityMetrics.trashContent}%</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700">USDA Classification</label>
                          <p className="text-sm text-gray-900">{selectedBatch.ginData.qualityMetrics.usdaClassification}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">USDA Sort Category</label>
                          <p className="text-sm text-gray-900">{selectedBatch.ginData.qualityMetrics.usdaSortCategory}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {selectedBatch.ginData.comments && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Processing Notes</h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-900">{selectedBatch.ginData.comments}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Farm Location Map */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Farm Location & Yield Map</h2>
            </div>
            <div className="p-6">
              <div className="h-[400px] rounded-lg overflow-hidden">
                <Map
                  {...viewState}
                  onMove={evt => setViewState(evt.viewState)}
                  mapboxAccessToken={MAPBOX_TOKEN}
                  mapStyle="mapbox://styles/mapbox/satellite-v9"
                  interactive={true}
                >
                  {/* Yield Heatmap Layer */}
                  <Source type="geojson" data={YIELD_DATA}>
                    <Layer {...heatmapLayer} />
                  </Source>

                  {/* Farm Boundary */}
                  <Source type="geojson" data={FARM_POLYGON}>
                    <Layer {...farmPolygonLayer} />
                    <Layer {...farmPolygonOutlineLayer} />
                  </Source>

                  {/* Farm Center Marker */}
                  <Marker
                    longitude={selectedBatch.location.longitude}
                    latitude={selectedBatch.location.latitude}
                  >
                    <div className="p-2 bg-white rounded-full shadow-lg">
                      <MapPin className="h-5 w-5 text-green-500" />
                    </div>
                  </Marker>
                </Map>
              </div>

              {/* Map Legend */}
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Yield Information</h3>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
                    <span className="text-sm text-gray-600">High Yield</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-yellow-500 rounded mr-2"></div>
                    <span className="text-sm text-gray-600">Medium Yield</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
                    <span className="text-sm text-gray-600">Low Yield</span>
                  </div>
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  Total Area: {selectedBatch.equipmentData.fieldArea.value} {selectedBatch.equipmentData.fieldArea.unit}
                </div>
              </div>
            </div>
          </div>

          {/* Blockchain Information */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Blockchain Information</h2>
            </div>
            <div className="p-6">
              {selectedBatch.blockchainTokenId ? (
                <div className="p-4 bg-indigo-50 rounded-md">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Shield className="h-5 w-5 text-indigo-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-indigo-800">Blockchain Token ID</p>
                      <div className="flex items-center space-x-2">
                        <p className="text-sm text-indigo-700 font-mono">{selectedBatch.blockchainTokenId}</p>
                        <button 
                          onClick={() => navigator.clipboard.writeText(selectedBatch.blockchainTokenId)}
                          className="text-indigo-600 hover:text-indigo-800"
                          title="Copy to clipboard"
                        >
                          <LinkIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="ml-auto">
                      <a 
                        href={`https://etherscan.io/token/${selectedBatch.blockchainTokenId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        View on Explorer
                      </a>
                    </div>
                  </div>
                  
                  {/* Transaction History */}
                  <div className="mt-4 border-t border-indigo-100 pt-4">
                    <h3 className="text-sm font-medium text-indigo-800 mb-3">Transaction History</h3>
                    <div className="space-y-3">
                      {selectedBatch.custodyChain.map((event, index) => (
                        event.blockchainTransactionId && (
                          <div key={index} className="flex items-center justify-between text-sm">
                            <div className="flex items-center space-x-2">
                              <History className="h-4 w-4 text-indigo-400" />
                              <span className="text-gray-600">{new Date(event.timestamp).toLocaleString()}</span>
                              <span className="text-gray-500">•</span>
                              <span className="text-gray-600">{event.fromEntity} → {event.toEntity}</span>
                            </div>
                            <a
                              href={`https://etherscan.io/tx/${event.blockchainTransactionId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-600 hover:text-indigo-800 font-mono text-sm"
                            >
                              {event.blockchainTransactionId.slice(0, 8)}...{event.blockchainTransactionId.slice(-6)}
                              <ExternalLink className="h-3 w-3 ml-1 inline" />
                            </a>
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="mt-3 text-sm text-gray-500">No blockchain token associated with this batch.</p>
              )}
            </div>
          </div>

          {/* Isotope Marking */}
          {selectedBatch.isotopeMarking && (
            <div className="bg-white rounded-lg shadow mb-6">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Isotope Marking</h2>
              </div>
              <div className="p-6">
                <div className="p-4 bg-green-50 rounded-md">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Leaf className="h-5 w-5 text-green-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-800">
                        {selectedBatch.isotopeMarking.markingType}
                      </p>
                      <p className="text-sm text-green-700">
                        Applied on {new Date(selectedBatch.isotopeMarking.markingDate).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-green-700">
                        Verification Status: 
                        <span className={`ml-1 font-medium ${
                          selectedBatch.isotopeMarking.verificationStatus === 'verified' 
                            ? 'text-green-800' 
                            : selectedBatch.isotopeMarking.verificationStatus === 'pending'
                            ? 'text-yellow-800'
                            : 'text-red-800'
                        }`}>
                          {selectedBatch.isotopeMarking.verificationStatus.charAt(0).toUpperCase() + 
                           selectedBatch.isotopeMarking.verificationStatus.slice(1)}
                        </span>
                      </p>
                      {selectedBatch.isotopeMarking.lastVerificationDate && (
                        <p className="text-sm text-green-700">
                          Last verified: {new Date(selectedBatch.isotopeMarking.lastVerificationDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="ml-auto">
                      <a 
                        href={`https://verify.isotrace.org/batch/${selectedBatch.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        View on Explorer
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Chain of Custody */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Chain of Custody</h2>
            </div>
            <div className="p-6">
              <div className="flow-root">
                <ul className="-mb-8">
                  {selectedBatch.custodyChain.map((event, index) => (
                    <li key={index}>
                      <div className="relative pb-8">
                        {index < selectedBatch.custodyChain.length - 1 && (
                          <span
                            className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200"
                            aria-hidden="true"
                          />
                        )}
                        <div className="relative flex items-start space-x-3">
                          <div className="relative">
                            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center ring-8 ring-white">
                              <Truck className="h-5 w-5 text-indigo-600" />
                            </div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div>
                              <div className="text-sm">
                                <span className="font-medium text-gray-900">
                                  {event.fromEntity} → {event.toEntity}
                                </span>
                              </div>
                              <p className="mt-0.5 text-sm text-gray-500">
                                {new Date(event.timestamp).toLocaleString()}
                              </p>
                            </div>
                            <div className="mt-2 text-sm text-gray-700">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm font-medium text-gray-900">Location</p>
                                  <p className="text-sm text-gray-500">
                                    {event.location.region}, {event.location.country}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {event.location.latitude.toFixed(4)}, {event.location.longitude.toFixed(4)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-900">Verification</p>
                                  <p className="text-sm text-gray-500">
                                    Method: {event.verificationMethod}
                                  </p>
                                  {event.transportMethod && (
                                    <p className="text-sm text-gray-500">
                                      Transport: {event.transportMethod}
                                    </p>
                                  )}
                                </div>
                              </div>
                              
                              {event.blockchainTransactionId && (
                                <div className="mt-2">
                                  <p className="text-sm font-medium text-gray-900">Blockchain Transaction</p>
                                  <p className="text-sm text-gray-500 font-mono">
                                    {event.blockchainTransactionId}
                                  </p>
                                </div>
                              )}
                              
                              {event.documents && event.documents.length > 0 && (
                                <div className="mt-2">
                                  <p className="text-sm font-medium text-gray-900">Documents</p>
                                  <ul className="mt-1 space-y-1">
                                    {event.documents.map((doc, index) => (
                                      <li key={index}>
                                        <button 
                                          onClick={() => handleDocumentDownload(doc, index)}
                                          className="flex items-center text-sm text-indigo-600 hover:text-indigo-900"
                                        >
                                          <FileText className="h-4 w-4 mr-1" />
                                          Transport Document {index + 1}
                                          <Download className="h-4 w-4 ml-1" />
                                        </button>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Compliance Status */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Compliance Status</h2>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Forced Labor Verification</h3>
                  <div className="mt-2">
                    <div className={`p-3 rounded-md ${
                      selectedBatch.complianceStatus.forcedLaborVerification.status === 'verified'
                        ? 'bg-green-50'
                        : selectedBatch.complianceStatus.forcedLaborVerification.status === 'pending'
                        ? 'bg-yellow-50'
                        : 'bg-red-50'
                    }`}>
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          {selectedBatch.complianceStatus.forcedLaborVerification.status === 'verified' ? (
                            <CheckCircle className="h-5 w-5 text-green-400" />
                          ) : selectedBatch.complianceStatus.forcedLaborVerification.status === 'pending' ? (
                            <Clock className="h-5 w-5 text-yellow-400" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-400" />
                          )}
                        </div>
                        <div className="ml-3">
                          <h4 className="text-sm font-medium text-gray-900">
                            {selectedBatch.complianceStatus.forcedLaborVerification.status === 'verified' ? 
                              'Batch Verified' : 
                              selectedBatch.complianceStatus.forcedLaborVerification.status === 'pending' ? 
                              'Verification Pending' : 
                              'Verification Failed'}
                          </h4>
                          {selectedBatch.complianceStatus.forcedLaborVerification.verificationDate && (
                            <p className="text-sm text-gray-500">
                              Verified on {new Date(selectedBatch.complianceStatus.forcedLaborVerification.verificationDate).toLocaleDateString()}
                            </p>
                          )}
                          {selectedBatch.complianceStatus.forcedLaborVerification.verifier && (
                            <p className="text-sm text-gray-500">
                              Verified by {selectedBatch.complianceStatus.forcedLaborVerification.verifier}
                            </p>
                          )}
                        </div>
                      </div>
                      {selectedBatch.complianceStatus.forcedLaborVerification.documents && 
                       selectedBatch.complianceStatus.forcedLaborVerification.documents.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm font-medium text-gray-700">Documentation</p>
                          <ul className="mt-2 space-y-2">
                            {selectedBatch.complianceStatus.forcedLaborVerification.documents.map((doc, index) => (
                              <li key={index}>
                                <button 
                                  onClick={() => downloadDocumentAsPdf(doc, `labor_verification_${index + 1}.pdf`)}
                                  className="flex items-center text-sm text-indigo-600 hover:text-indigo-900"
                                >
                                  <FileText className="h-4 w-4 mr-1" />
                                  Verification Document {index + 1}
                                  <Download className="h-4 w-4 ml-1" />
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Organic Status</h3>
                  <div className="mt-2">
                    <div className={`p-3 rounded-md ${
                      selectedBatch.complianceStatus.organicStatus.status === 'verified'
                        ? 'bg-green-50'
                        : selectedBatch.complianceStatus.organicStatus.status === 'pending'
                        ? 'bg-yellow-50'
                        : 'bg-red-50'
                    }`}>
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          {selectedBatch.complianceStatus.organicStatus.status === 'verified' ? (
                            <CheckCircle className="h-5 w-5 text-green-400" />
                          ) : selectedBatch.complianceStatus.organicStatus.status === 'pending' ? (
                            <Clock className="h-5 w-5 text-yellow-400" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-400" />
                          )}
                        </div>
                        <div className="ml-3">
                          <p className={`text-sm font-medium ${
                            selectedBatch.complianceStatus.organicStatus.status === 'verified'
                              ? 'text-green-800'
                              : selectedBatch.complianceStatus.organicStatus.status === 'pending'
                              ? 'text-yellow-800'
                              : 'text-red-800'
                          }`}>
                            {selectedBatch.complianceStatus.organicStatus.status.charAt(0).toUpperCase() + 
                             selectedBatch.complianceStatus.organicStatus.status.slice(1)}
                          </p>
                          {selectedBatch.complianceStatus.organicStatus.certificationId && (
                            <p className="text-sm text-gray-500">
                              Certification ID: {selectedBatch.complianceStatus.organicStatus.certificationId}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Regional Compliance</h3>
                  <div className="mt-2 space-y-3">
                    {selectedBatch.complianceStatus.regionalCompliance.map((compliance, index) => (
                      <div 
                        key={index}
                        className={`p-3 rounded-md ${
                          compliance.status === 'compliant'
                            ? 'bg-green-50'
                            : compliance.status === 'pending'
                            ? 'bg-yellow-50'
                            : 'bg-red-50'
                        }`}
                      >
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            {compliance.status === 'compliant' ? (
                              <CheckCircle className="h-5 w-5 text-green-400" />
                            ) : compliance.status === 'pending' ? (
                              <Clock className="h-5 w-5 text-yellow-400" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-400" />
                            )}
                          </div>
                          <div className="ml-3">
                            <p className={`text-sm font-medium ${
                              compliance.status === 'compliant'
                                ? 'text-green-800'
                                : compliance.status === 'pending'
                                ? 'text-yellow-800'
                                : 'text-red-800'
                            }`}>
                              {compliance.region}
                            </p>
                            <p className="text-sm text-gray-500">
                              Status: {compliance.status.charAt(0).toUpperCase() + compliance.status.slice(1)}
                            </p>
                          </div>
                        </div>
                        {compliance.requirements.length > 0 && (
                          <div className="mt-2 pl-8">
                            <p className="text-sm font-medium text-gray-700">Requirements:</p>
                            <ul className="mt-1 text-sm text-gray-500 list-disc pl-5 space-y-1">
                              {compliance.requirements.map((req, reqIndex) => (
                                <li key={reqIndex}>{req}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Certifications */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Certifications</h2>
            </div>
            <div className="p-6">
              {selectedBatch.certifications.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {selectedBatch.certifications.map((cert) => (
                    <li key={cert.id} className="py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                            cert.status === 'active' 
                              ? 'bg-green-100' 
                              : cert.status === 'expired'
                              ? 'bg-yellow-100'
                              : 'bg-red-100'
                          }`}>
                            <FileText className={`h-6 w-6 ${
                              cert.status === 'active' 
                                ? 'text-green-600' 
                                : cert.status === 'expired'
                                ? 'text-yellow-600'
                                : 'text-red-600'
                            }`} />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">{cert.name}</p>
                            <p className="text-xs text-gray-500">
                              Issued by {cert.issuer} on {new Date(cert.issueDate).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-gray-500">
                              Expires on {new Date(cert.expiryDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            cert.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : cert.status === 'expired'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {cert.status.charAt(0).toUpperCase() + cert.status.slice(1)}
                          </span>
                          <button 
                            onClick={() => handleCertificateDownload(cert)}
                            className="ml-2 text-indigo-600 hover:text-indigo-900"
                            title="Download Certificate"
                          >
                            <Download className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">No certifications available for this batch.</p>
              )}
            </div>
          </div>

          {/* Sustainability Score */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Sustainability Score</h2>
            </div>
            <div className="p-6">
              <div className="flex items-center">
                <div className="relative w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`absolute top-0 left-0 h-full ${
                      selectedBatch.sustainabilityScore >= 90 ? 'bg-green-500' :
                      selectedBatch.sustainabilityScore >= 70 ? 'bg-green-400' :
                      selectedBatch.sustainabilityScore >= 50 ? 'bg-yellow-400' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${selectedBatch.sustainabilityScore}%` }}
                  ></div>
                </div>
                <span className="ml-3 text-lg font-semibold text-gray-900">{selectedBatch.sustainabilityScore}</span>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-500">
                  {selectedBatch.sustainabilityScore >= 90 ? 'Excellent sustainability practices' :
                   selectedBatch.sustainabilityScore >= 70 ? 'Good sustainability practices' :
                   selectedBatch.sustainabilityScore >= 50 ? 'Average sustainability practices' :
                   'Poor sustainability practices - improvements needed'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatchDetail;