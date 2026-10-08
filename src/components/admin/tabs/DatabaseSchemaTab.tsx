import React, { useState } from 'react';
import { DATABASE_TABLES } from '../../../data/schemaDefinitions';
import { DatabaseTableDefinition } from '../../../types';
import { Database, Copy, Check, Table, Key, Layers, Code, ShieldCheck } from 'lucide-react';

export const DatabaseSchemaTab: React.FC = () => {
  const [selectedGroup, setSelectedGroup] = useState<string>('ALL');
  const [selectedTable, setSelectedTable] = useState<DatabaseTableDefinition>(DATABASE_TABLES[0]);
  const [copiedDDL, setCopiedDDL] = useState<boolean>(false);

  const groups = ['ALL', 'CATALOG', 'CUSTOMER', 'CHAT', 'AI KNOWLEDGE', 'SALES', 'ANALYTICS'];

  const filteredTables = selectedGroup === 'ALL'
    ? DATABASE_TABLES
    : DATABASE_TABLES.filter((t) => t.group === selectedGroup);

  const handleCopyDDL = (ddl: string) => {
    navigator.clipboard.writeText(ddl);
    setCopiedDDL(true);
    setTimeout(() => setCopiedDDL(false), 2000);
  };

  const fullSchemaSql = DATABASE_TABLES.map((t) => `-- ==========================================\n-- Table: ${t.name} (${t.group})\n-- ==========================================\n${t.sqlDDL}`).join('\n\n');

  return (
    <div className="space-y-6 max-w-6xl mx-auto w-full">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
              POSTGRESQL + PGVECTOR
            </span>
            <h2 className="text-xl font-black text-white tracking-tight">
              Thiết Kế Database Schema Chuẩn Hóa Cho Đệm Xanh
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Phân tách 3 lớp: Dữ liệu động (Catalog/Giá/Tồn kho) ↔ Dữ liệu tĩnh (RAG Vector) ↔ Quy tắc nghiệp vụ (Business Rules)
          </p>
        </div>

        <button
          onClick={() => handleCopyDDL(fullSchemaSql)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition shadow-md"
        >
          {copiedDDL ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
          <span>{copiedDDL ? 'Đã sao chép toàn bộ SQL' : 'Copy Full SQL DDL Script'}</span>
        </button>
      </div>

      {/* Group Selector Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-semibold">
        {groups.map((grp) => (
          <button
            key={grp}
            onClick={() => setSelectedGroup(grp)}
            className={`px-3 py-1.5 rounded-xl transition whitespace-nowrap ${
              selectedGroup === grp
                ? 'bg-emerald-600 text-white font-bold shadow-md'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800 hover:bg-slate-900'
            }`}
          >
            {grp} {grp !== 'ALL' && `(${DATABASE_TABLES.filter((t) => t.group === grp).length})`}
          </button>
        ))}
      </div>

      {/* Main 2-Column Explorer: Left table list, Right Table Columns & DDL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Tables List */}
        <div className="lg:col-span-4 bg-slate-950 rounded-2xl border border-slate-800 p-3 space-y-2 max-h-[640px] overflow-y-auto">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
            Danh sách bảng ({filteredTables.length} tables)
          </div>

          <div className="space-y-1.5">
            {filteredTables.map((t) => {
              const isSelected = selectedTable.name === t.name;
              return (
                <div
                  key={t.name}
                  onClick={() => setSelectedTable(t)}
                  className={`p-3 rounded-xl cursor-pointer transition border text-xs flex flex-col gap-1 ${
                    isSelected
                      ? 'bg-slate-900 border-emerald-500 text-white shadow-md'
                      : 'bg-slate-950/60 border-slate-850 text-slate-300 hover:border-slate-700 hover:bg-slate-900/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                      <Table className="w-3.5 h-3.5 text-slate-400" />
                      {t.name}
                    </span>
                    <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded font-mono">
                      {t.group}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-1">{t.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Table Inspector & DDL */}
        <div className="lg:col-span-8 bg-slate-950 rounded-2xl border border-slate-800 p-5 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-base font-black text-white">
                  table {selectedTable.name}
                </span>
                <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded font-bold">
                  {selectedTable.group}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">{selectedTable.description}</p>
            </div>

            <button
              onClick={() => handleCopyDDL(selectedTable.sqlDDL)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 flex items-center gap-1.5 transition"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy DDL</span>
            </button>
          </div>

          {/* Columns Table */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span>Đặc tả các cột dữ liệu (Columns & Constraints)</span>
            </h4>

            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-xs">
                <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 text-[11px]">
                  <tr>
                    <th className="text-left p-2.5">Tên Cột</th>
                    <th className="text-left p-2.5">Kiểu Dữ Liệu</th>
                    <th className="text-left p-2.5">Ràng Buộc</th>
                    <th className="text-left p-2.5">Mô Tả Chức Năng</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {selectedTable.columns.map((col) => (
                    <tr key={col.name} className="hover:bg-slate-900/60">
                      <td className="p-2.5 font-mono font-bold text-slate-100 flex items-center gap-1.5">
                        {col.isPrimary && (
                          <span className="text-amber-400 font-mono text-[10px]" title="Primary Key">
                            [PK]
                          </span>
                        )}
                        {col.isForeign && (
                          <span className="text-blue-400 font-mono text-[10px]" title="Foreign Key">
                            [FK]
                          </span>
                        )}
                        <span>{col.name}</span>
                      </td>
                      <td className="p-2.5 font-mono text-emerald-400 text-[11px]">{col.type}</td>
                      <td className="p-2.5 text-slate-400 text-[11px]">
                        {col.nullable ? 'NULL' : 'NOT NULL'}
                        {col.foreignRef && ` → ${col.foreignRef}`}
                      </td>
                      <td className="p-2.5 text-slate-300 text-[11px]">{col.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* SQL DDL Code View */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Code className="w-3.5 h-3.5 text-emerald-400" />
              <span>PostgreSQL DDL</span>
            </h4>
            <pre className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed">
              {selectedTable.sqlDDL}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
