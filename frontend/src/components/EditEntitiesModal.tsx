import { useState } from 'react';
import { X, Plus, Trash2, Save } from 'lucide-react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

interface Entity {
  id: string;
  type: string;
  value: string;
  confidence: number;
}

interface Document {
  id: string;
  title: string;
  entities?: Entity[];
}

interface Props {
  document: Document;
  onClose: () => void;
  onSave: (entities: Omit<Entity, 'id'>[]) => Promise<void>;
}

export function EditEntitiesModal({ document, onClose, onSave }: Props) {
  const [entities, setEntities] = useState<Omit<Entity, 'id'>[]>(
    (document.entities || []).map(e => ({ type: e.type, value: e.value, confidence: e.confidence }))
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleAdd = () => {
    setEntities([...entities, { type: '', value: '', confidence: 1 }]);
  };

  const handleRemove = (index: number) => {
    const newEntities = [...entities];
    newEntities.splice(index, 1);
    setEntities(newEntities);
  };

  const handleChange = (index: number, field: 'type' | 'value', val: string) => {
    const newEntities = [...entities];
    newEntities[index][field] = val;
    // When a user manually edits, confidence goes to 100%
    newEntities[index].confidence = 1;
    setEntities(newEntities);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(entities.filter(e => e.type.trim() && e.value.trim()));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <Card className="w-full max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden shadow-[8px_8px_0px_0px_#111]">
        <div className="flex justify-between items-center p-4 border-b border-border bg-gray-50">
          <h2 className="font-pixel font-bold text-lg">Edit Extractions: {document.title}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 border border-transparent hover:border-border transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto flex-1 space-y-3 bg-gray-100">
          {entities.map((entity, idx) => (
            <div key={idx} className={`flex items-center gap-3 p-3 bg-white border shadow-[2px_2px_0px_0px_#111] ${entity.confidence && entity.confidence < 0.8 ? 'border-orange-500' : 'border-border'}`}>
              <div className="flex-1">
                <label className="text-xs font-pixel text-gray-500 mb-1 block">Field Type</label>
                <input 
                  type="text" 
                  value={entity.type}
                  onChange={(e) => handleChange(idx, 'type', e.target.value)}
                  placeholder="e.g. Invoice Number"
                  className="w-full px-2 py-1 border-2 border-border shadow-[2px_2px_0px_0px_#111] focus:outline-none text-sm"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs font-pixel text-gray-500 mb-1 block">Extracted Value</label>
                <input 
                  type="text" 
                  value={entity.value}
                  onChange={(e) => handleChange(idx, 'value', e.target.value)}
                  placeholder="e.g. INV-1002"
                  className="w-full px-2 py-1 border-2 border-border shadow-[2px_2px_0px_0px_#111] focus:outline-none text-sm"
                />
              </div>
              <div className="pt-5">
                <button 
                  onClick={() => handleRemove(idx)}
                  className="p-2 text-red-600 hover:bg-red-50 border border-transparent hover:border-red-600 transition-colors"
                  title="Remove Field"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}

          {entities.length === 0 && (
            <p className="text-center text-sm text-gray-500 py-4">No fields extracted. Add one manually.</p>
          )}

          <Button variant="outline" onClick={handleAdd} className="w-full border-dashed flex justify-center items-center gap-2 mt-4 bg-white">
            <Plus size={16} /> Add Missing Field
          </Button>
        </div>

        <div className="p-4 border-t border-border bg-white flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2">
            <Save size={16} /> {isSaving ? 'Saving...' : 'Save Extractions'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
