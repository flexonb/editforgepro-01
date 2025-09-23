import React, { useState } from 'react';
import { Globe, Send, Copy, Download, Plus, Trash2, Eye, Code } from 'lucide-react';

interface Request {
  id: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  headers: Record<string, string>;
  body: string;
}

interface Response {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: string;
  time: number;
}

export function APITester() {
  const [requests, setRequests] = useState<Request[]>([
    {
      id: '1',
      name: 'Get Users',
      method: 'GET',
      url: 'https://jsonplaceholder.typicode.com/users',
      headers: { 'Content-Type': 'application/json' },
      body: ''
    }
  ]);
  
  const [selectedRequest, setSelectedRequest] = useState<string>('1');
  const [response, setResponse] = useState<Response | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'headers' | 'body' | 'response'>('headers');

  const currentRequest = requests.find(r => r.id === selectedRequest);

  const addRequest = () => {
    const newRequest: Request = {
      id: Date.now().toString(),
      name: 'New Request',
      method: 'GET',
      url: 'https://api.example.com/endpoint',
      headers: { 'Content-Type': 'application/json' },
      body: ''
    };
    setRequests(prev => [...prev, newRequest]);
    setSelectedRequest(newRequest.id);
  };

  const updateRequest = (field: keyof Request, value: any) => {
    setRequests(prev => prev.map(req => 
      req.id === selectedRequest ? { ...req, [field]: value } : req
    ));
  };

  const deleteRequest = (id: string) => {
    setRequests(prev => prev.filter(r => r.id !== id));
    if (selectedRequest === id) {
      setSelectedRequest(requests[0]?.id || '');
    }
  };

  const addHeader = () => {
    if (!currentRequest) return;
    const newHeaders = { ...currentRequest.headers, '': '' };
    updateRequest('headers', newHeaders);
  };

  const updateHeader = (oldKey: string, newKey: string, value: string) => {
    if (!currentRequest) return;
    const headers = { ...currentRequest.headers };
    if (oldKey !== newKey) {
      delete headers[oldKey];
    }
    headers[newKey] = value;
    updateRequest('headers', headers);
  };

  const deleteHeader = (key: string) => {
    if (!currentRequest) return;
    const headers = { ...currentRequest.headers };
    delete headers[key];
    updateRequest('headers', headers);
  };

  const sendRequest = async () => {
    if (!currentRequest) return;
    
    setLoading(true);
    const startTime = Date.now();
    
    try {
      const options: RequestInit = {
        method: currentRequest.method,
        headers: currentRequest.headers,
      };
      
      if (currentRequest.method !== 'GET' && currentRequest.body) {
        options.body = currentRequest.body;
      }
      
      const response = await fetch(currentRequest.url, options);
      const endTime = Date.now();
      
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });
      
      const responseData = await response.text();
      
      setResponse({
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
        data: responseData,
        time: endTime - startTime
      });
    } catch (error) {
      setResponse({
        status: 0,
        statusText: 'Network Error',
        headers: {},
        data: error instanceof Error ? error.message : 'Unknown error',
        time: Date.now() - startTime
      });
    } finally {
      setLoading(false);
    }
  };

  const formatJSON = (text: string) => {
    try {
      return JSON.stringify(JSON.parse(text), null, 2);
    } catch {
      return text;
    }
  };

  const copyResponse = () => {
    if (response) {
      navigator.clipboard.writeText(response.data);
    }
  };

  const downloadResponse = () => {
    if (!response) return;
    
    const blob = new Blob([response.data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `response-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'text-green-600';
    if (status >= 300 && status < 400) return 'text-yellow-600';
    if (status >= 400) return 'text-red-600';
    return 'text-slate-600';
  };

  return (
    <div className="h-full flex flex-col bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200">
        <div className="flex items-center space-x-2">
          <Globe className="w-5 h-5 text-purple-600" />
          <h2 className="text-lg font-semibold text-slate-900">API Tester</h2>
        </div>
        
        <button
          onClick={addRequest}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Request</span>
        </button>
      </div>

      <div className="flex-1 flex">
        {/* Requests Sidebar */}
        <div className="w-64 p-4 border-r border-slate-200 space-y-4">
          <h3 className="text-sm font-semibold text-slate-700">Requests</h3>
          <div className="space-y-1">
            {requests.map(request => (
              <div key={request.id} className="flex items-center justify-between group">
                <button
                  onClick={() => setSelectedRequest(request.id)}
                  className={`flex-1 text-left px-3 py-2 rounded transition-colors ${
                    selectedRequest === request.id
                      ? 'bg-purple-100 text-purple-700'
                      : 'hover:bg-slate-100'
                  }`}
                >
                  <div className="font-medium text-sm">{request.name}</div>
                  <div className="text-xs text-slate-500">
                    <span className={`px-1 py-0.5 rounded text-xs font-mono ${
                      request.method === 'GET' ? 'bg-green-100 text-green-700' :
                      request.method === 'POST' ? 'bg-blue-100 text-blue-700' :
                      request.method === 'PUT' ? 'bg-yellow-100 text-yellow-700' :
                      request.method === 'DELETE' ? 'bg-red-100 text-red-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {request.method}
                    </span>
                  </div>
                </button>
                <button
                  onClick={() => deleteRequest(request.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-red-600 hover:text-red-800 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {currentRequest ? (
            <>
              {/* Request Configuration */}
              <div className="p-4 border-b border-slate-200 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Request Name</label>
                  <input
                    type="text"
                    value={currentRequest.name}
                    onChange={(e) => updateRequest('name', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg"
                  />
                </div>
                
                <div className="flex space-x-2">
                  <select
                    value={currentRequest.method}
                    onChange={(e) => updateRequest('method', e.target.value)}
                    className="px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                    <option value="PATCH">PATCH</option>
                  </select>
                  
                  <input
                    type="url"
                    value={currentRequest.url}
                    onChange={(e) => updateRequest('url', e.target.value)}
                    placeholder="Enter API endpoint URL"
                    className="flex-1 px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg"
                  />
                  
                  <button
                    onClick={sendRequest}
                    disabled={loading}
                    className="flex items-center space-x-2 px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    <span>{loading ? 'Sending...' : 'Send'}</span>
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-slate-200">
                <button
                  onClick={() => setActiveTab('headers')}
                  className={`px-4 py-2 text-sm font-medium ${
                    activeTab === 'headers'
                      ? 'border-b-2 border-purple-500 text-purple-600'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Headers
                </button>
                <button
                  onClick={() => setActiveTab('body')}
                  className={`px-4 py-2 text-sm font-medium ${
                    activeTab === 'body'
                      ? 'border-b-2 border-purple-500 text-purple-600'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Body
                </button>
                <button
                  onClick={() => setActiveTab('response')}
                  className={`px-4 py-2 text-sm font-medium ${
                    activeTab === 'response'
                      ? 'border-b-2 border-purple-500 text-purple-600'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Response
                </button>
              </div>

              {/* Tab Content */}
              <div className="flex-1 p-4 overflow-y-auto">
                {activeTab === 'headers' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-slate-900">Headers</h3>
                      <button
                        onClick={addHeader}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
                      >
                        Add Header
                      </button>
                    </div>
                    
                    <div className="space-y-2">
                      {Object.entries(currentRequest.headers).map(([key, value]) => (
                        <div key={key} className="grid grid-cols-5 gap-2">
                          <input
                            type="text"
                            value={key}
                            onChange={(e) => updateHeader(key, e.target.value, value)}
                            placeholder="Header name"
                            className="col-span-2 px-3 py-2 bg-slate-100 border border-slate-300 rounded"
                          />
                          <input
                            type="text"
                            value={value}
                            onChange={(e) => updateHeader(key, key, e.target.value)}
                            placeholder="Header value"
                            className="col-span-2 px-3 py-2 bg-slate-100 border border-slate-300 rounded"
                          />
                          <button
                            onClick={() => deleteHeader(key)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'body' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-900">Request Body</h3>
                    <textarea
                      value={currentRequest.body}
                      onChange={(e) => updateRequest('body', e.target.value)}
                      placeholder="Enter request body (JSON, XML, etc.)"
                      className="w-full h-64 px-4 py-3 bg-slate-100 border border-slate-300 rounded-lg font-mono text-sm resize-none"
                    />
                    <button
                      onClick={() => updateRequest('body', formatJSON(currentRequest.body))}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
                    >
                      Format JSON
                    </button>
                  </div>
                )}

                {activeTab === 'response' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-slate-900">Response</h3>
                      {response && (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={copyResponse}
                            className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded text-sm transition-colors"
                          >
                            <Copy className="w-4 h-4 inline mr-1" />
                            Copy
                          </button>
                          <button
                            onClick={downloadResponse}
                            className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-sm transition-colors"
                          >
                            <Download className="w-4 h-4 inline mr-1" />
                            Download
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {response ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                          <div className="bg-slate-100 rounded-lg p-3">
                            <div className="text-sm text-slate-600">Status</div>
                            <div className={`text-lg font-semibold ${getStatusColor(response.status)}`}>
                              {response.status} {response.statusText}
                            </div>
                          </div>
                          <div className="bg-slate-100 rounded-lg p-3">
                            <div className="text-sm text-slate-600">Time</div>
                            <div className="text-lg font-semibold text-slate-900">{response.time}ms</div>
                          </div>
                          <div className="bg-slate-100 rounded-lg p-3">
                            <div className="text-sm text-slate-600">Size</div>
                            <div className="text-lg font-semibold text-slate-900">
                              {new Blob([response.data]).size} bytes
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-semibold text-slate-700 mb-2">Response Headers</h4>
                          <div className="bg-slate-100 rounded-lg p-3 max-h-32 overflow-y-auto">
                            <pre className="text-xs font-mono">
                              {Object.entries(response.headers).map(([key, value]) => 
                                `${key}: ${value}`
                              ).join('\n')}
                            </pre>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-semibold text-slate-700 mb-2">Response Body</h4>
                          <div className="bg-slate-100 rounded-lg p-3 max-h-96 overflow-y-auto">
                            <pre className="text-xs font-mono whitespace-pre-wrap">
                              {formatJSON(response.data)}
                            </pre>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-slate-500">
                        <Globe className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Send a request to see the response here</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Globe className="w-16 h-16 mx-auto mb-4 text-slate-400" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No Request Selected</h3>
                <p className="text-slate-600">Create a new request or select one from the sidebar.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}