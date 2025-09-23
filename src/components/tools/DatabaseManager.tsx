import React, { useState } from 'react';
import { Database, Plus, Trash2, Edit, Search, Download, Upload, Table, Key, Users } from 'lucide-react';

interface Table {
  id: string;
  name: string;
  columns: Column[];
  rows: Record<string, any>[];
}

interface Column {
  name: string;
  type: 'text' | 'number' | 'boolean' | 'date';
  primaryKey?: boolean;
}

export function DatabaseManager() {
  const [tables, setTables] = useState<Table[]>([
    {
      id: '1',
      name: 'users',
      columns: [
        { name: 'id', type: 'number', primaryKey: true },
        { name: 'name', type: 'text' },
        { name: 'email', type: 'text' },
        { name: 'active', type: 'boolean' },
        { name: 'created_at', type: 'date' }
      ],
      rows: [
        { id: 1, name: 'John Doe', email: 'john@example.com', active: true, created_at: '2024-01-15' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', active: false, created_at: '2024-01-16' }
      ]
    }
  ]);
  
  const [selectedTable, setSelectedTable] = useState<string>('1');
  const [showCreateTable, setShowCreateTable] = useState(false);
  const [showCreateRow, setShowCreateRow] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sqlQuery, setSqlQuery] = useState('SELECT * FROM users;');
  const [queryResult, setQueryResult] = useState('');

  const [newTable, setNewTable] = useState({
    name: '',
    columns: [{ name: 'id', type: 'number' as const, primaryKey: true }]
  });

  const [newRow, setNewRow] = useState<Record<string, any>>({});

  const currentTable = tables.find(t => t.id === selectedTable);

  const addColumn = () => {
    setNewTable(prev => ({
      ...prev,
      columns: [...prev.columns, { name: '', type: 'text', primaryKey: false }]
    }));
  };

  const updateColumn = (index: number, field: string, value: any) => {
    setNewTable(prev => ({
      ...prev,
      columns: prev.columns.map((col, i) => 
        i === index ? { ...col, [field]: value } : col
      )
    }));
  };

  const createTable = () => {
    if (!newTable.name) return;
    
    const table: Table = {
      id: Date.now().toString(),
      name: newTable.name,
      columns: newTable.columns.filter(col => col.name),
      rows: []
    };
    
    setTables(prev => [...prev, table]);
    setNewTable({ name: '', columns: [{ name: 'id', type: 'number', primaryKey: true }] });
    setShowCreateTable(false);
  };

  const deleteTable = (tableId: string) => {
    setTables(prev => prev.filter(t => t.id !== tableId));
    if (selectedTable === tableId) {
      setSelectedTable(tables[0]?.id || '');
    }
  };

  const addRow = () => {
    if (!currentTable) return;
    
    const row = { ...newRow };
    // Auto-generate ID if it's a primary key
    const idColumn = currentTable.columns.find(col => col.primaryKey);
    if (idColumn && !row[idColumn.name]) {
      row[idColumn.name] = Math.max(...currentTable.rows.map(r => r[idColumn.name] || 0), 0) + 1;
    }
    
    setTables(prev => prev.map(table => 
      table.id === selectedTable 
        ? { ...table, rows: [...table.rows, row] }
        : table
    ));
    
    setNewRow({});
    setShowCreateRow(false);
  };

  const deleteRow = (rowIndex: number) => {
    setTables(prev => prev.map(table => 
      table.id === selectedTable 
        ? { ...table, rows: table.rows.filter((_, i) => i !== rowIndex) }
        : table
    ));
  };

  const executeQuery = () => {
    try {
      // Simple query parser for demonstration
      const query = sqlQuery.toLowerCase().trim();
      
      if (query.startsWith('select')) {
        const tableName = query.match(/from\s+(\w+)/)?.[1];
        const table = tables.find(t => t.name.toLowerCase() === tableName);
        
        if (table) {
          let result = table.rows;
          
          // Simple WHERE clause
          const whereMatch = query.match(/where\s+(.+?)(?:\s+order|\s+limit|$)/);
          if (whereMatch) {
            const condition = whereMatch[1];
            // Very basic condition parsing
            const [column, operator, value] = condition.split(/\s*(=|!=|>|<)\s*/);
            if (column && operator && value) {
              result = result.filter(row => {
                const rowValue = row[column.trim()];
                const compareValue = value.replace(/['"]/g, '');
                
                switch (operator) {
                  case '=': return String(rowValue) === compareValue;
                  case '!=': return String(rowValue) !== compareValue;
                  case '>': return Number(rowValue) > Number(compareValue);
                  case '<': return Number(rowValue) < Number(compareValue);
                  default: return true;
                }
              });
            }
          }
          
          setQueryResult(JSON.stringify(result, null, 2));
        } else {
          setQueryResult('Table not found');
        }
      } else {
        setQueryResult('Only SELECT queries are supported in this demo');
      }
    } catch (error) {
      setQueryResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const exportData = () => {
    const data = {
      tables: tables.map(table => ({
        name: table.name,
        columns: table.columns,
        rows: table.rows
      }))
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'database.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredRows = currentTable?.rows.filter(row =>
    Object.values(row).some(value => 
      String(value).toLowerCase().includes(searchQuery.toLowerCase())
    )
  ) || [];

  return (
    <div className="h-full flex flex-col bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200">
        <div className="flex items-center space-x-2">
          <Database className="w-5 h-5 text-purple-600" />
          <h2 className="text-lg font-semibold text-slate-900">Database Manager</h2>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowCreateTable(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Table</span>
          </button>
          
          <button
            onClick={exportData}
            className="flex items-center space-x-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Tables Sidebar */}
        <div className="w-64 p-4 border-r border-slate-200 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center">
              <Table className="w-4 h-4 mr-2" />
              Tables
            </h3>
            <div className="space-y-1">
              {tables.map(table => (
                <div key={table.id} className="flex items-center justify-between group">
                  <button
                    onClick={() => setSelectedTable(table.id)}
                    className={`flex-1 text-left px-3 py-2 rounded transition-colors ${
                      selectedTable === table.id
                        ? 'bg-purple-100 text-purple-700'
                        : 'hover:bg-slate-100'
                    }`}
                  >
                    <div className="font-medium">{table.name}</div>
                    <div className="text-xs text-slate-500">{table.rows.length} rows</div>
                  </button>
                  <button
                    onClick={() => deleteTable(table.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-red-600 hover:text-red-800 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* SQL Query */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3">SQL Query</h3>
            <textarea
              value={sqlQuery}
              onChange={(e) => setSqlQuery(e.target.value)}
              className="w-full h-24 px-3 py-2 bg-slate-100 border border-slate-300 rounded text-sm font-mono resize-none"
              placeholder="Enter SQL query..."
            />
            <button
              onClick={executeQuery}
              className="w-full mt-2 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
            >
              Execute Query
            </button>
            
            {queryResult && (
              <div className="mt-2 p-2 bg-slate-100 rounded text-xs font-mono max-h-32 overflow-y-auto">
                <pre>{queryResult}</pre>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4">
          {currentTable ? (
            <div className="space-y-4">
              {/* Table Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{currentTable.name}</h3>
                  <p className="text-sm text-slate-600">{currentTable.rows.length} rows, {currentTable.columns.length} columns</p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search rows..."
                      className="pl-10 pr-4 py-2 bg-slate-100 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                  
                  <button
                    onClick={() => setShowCreateRow(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Row</span>
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        {currentTable.columns.map(column => (
                          <th key={column.name} className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                            <div className="flex items-center space-x-1">
                              <span>{column.name}</span>
                              {column.primaryKey && <Key className="w-3 h-3 text-amber-500" />}
                              <span className="text-slate-400">({column.type})</span>
                            </div>
                          </th>
                        ))}
                        <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                      {filteredRows.map((row, index) => (
                        <tr key={index} className="hover:bg-slate-50">
                          {currentTable.columns.map(column => (
                            <td key={column.name} className="px-4 py-3 text-sm text-slate-900">
                              {column.type === 'boolean' 
                                ? (row[column.name] ? '✓' : '✗')
                                : String(row[column.name] || '')
                              }
                            </td>
                          ))}
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => deleteRow(index)}
                              className="text-red-600 hover:text-red-800 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <Database className="w-16 h-16 mx-auto mb-4 text-slate-400" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No Table Selected</h3>
                <p className="text-slate-600">Select a table from the sidebar or create a new one.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Table Modal */}
      {showCreateTable && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Create New Table</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Table Name</label>
                <input
                  type="text"
                  value={newTable.name}
                  onChange={(e) => setNewTable(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg"
                  placeholder="Enter table name"
                />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-slate-700">Columns</label>
                  <button
                    onClick={addColumn}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
                  >
                    Add Column
                  </button>
                </div>
                
                <div className="space-y-2">
                  {newTable.columns.map((column, index) => (
                    <div key={index} className="grid grid-cols-4 gap-2">
                      <input
                        type="text"
                        value={column.name}
                        onChange={(e) => updateColumn(index, 'name', e.target.value)}
                        placeholder="Column name"
                        className="px-3 py-2 bg-slate-100 border border-slate-300 rounded text-sm"
                      />
                      <select
                        value={column.type}
                        onChange={(e) => updateColumn(index, 'type', e.target.value)}
                        className="px-3 py-2 bg-slate-100 border border-slate-300 rounded text-sm"
                      >
                        <option value="text">Text</option>
                        <option value="number">Number</option>
                        <option value="boolean">Boolean</option>
                        <option value="date">Date</option>
                      </select>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={column.primaryKey || false}
                          onChange={(e) => updateColumn(index, 'primaryKey', e.target.checked)}
                          className="rounded"
                        />
                        <span className="text-sm">Primary Key</span>
                      </label>
                      <button
                        onClick={() => setNewTable(prev => ({
                          ...prev,
                          columns: prev.columns.filter((_, i) => i !== index)
                        }))}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={createTable}
                className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                Create Table
              </button>
              <button
                onClick={() => setShowCreateTable(false)}
                className="flex-1 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Row Modal */}
      {showCreateRow && currentTable && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Add New Row</h3>
            
            <div className="space-y-3">
              {currentTable.columns.map(column => (
                <div key={column.name}>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {column.name} {column.primaryKey && '(Primary Key)'}
                  </label>
                  {column.type === 'boolean' ? (
                    <select
                      value={newRow[column.name] || 'false'}
                      onChange={(e) => setNewRow(prev => ({ ...prev, [column.name]: e.target.value === 'true' }))}
                      className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg"
                    >
                      <option value="false">False</option>
                      <option value="true">True</option>
                    </select>
                  ) : (
                    <input
                      type={column.type === 'number' ? 'number' : column.type === 'date' ? 'date' : 'text'}
                      value={newRow[column.name] || ''}
                      onChange={(e) => setNewRow(prev => ({ 
                        ...prev, 
                        [column.name]: column.type === 'number' ? Number(e.target.value) : e.target.value 
                      }))}
                      className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg"
                      placeholder={column.primaryKey ? 'Auto-generated if empty' : `Enter ${column.name}`}
                    />
                  )}
                </div>
              ))}
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={addRow}
                className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                Add Row
              </button>
              <button
                onClick={() => setShowCreateRow(false)}
                className="flex-1 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}