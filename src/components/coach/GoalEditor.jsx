import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';

const quillModules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{'list': 'ordered'}, {'list': 'bullet'}],
    ['link'],
    ['clean']
  ],
};

export default function GoalEditor({ sectionTitle, goalData, onUpdate }) {
  const handleInstructionChange = (content) => {
    onUpdate('instructions', content);
  };

  const handleLinkChange = (index, field, value) => {
    const newLinks = [...(goalData.links || [])];
    newLinks[index][field] = value;
    onUpdate('links', newLinks);
  };

  const addLink = () => {
    const newLinks = [...(goalData.links || []), { title: '', url: '' }];
    onUpdate('links', newLinks);
  };

  const removeLink = (index) => {
    const newLinks = (goalData.links || []).filter((_, i) => i !== index);
    onUpdate('links', newLinks);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-stone-800">{sectionTitle} Goal</h3>
      <div>
        <Label className="font-medium text-stone-700">Goal Title</Label>
        <Input
          placeholder="e.g., Improve Sleep Quality"
          value={goalData.goal || ''}
          onChange={(e) => onUpdate('goal', e.target.value)}
          className="mt-1 border-sage-200"
        />
      </div>
      <div>
        <Label className="font-medium text-stone-700">Instructions & Information</Label>
        <ReactQuill
          theme="snow"
          value={goalData.instructions || ''}
          onChange={handleInstructionChange}
          modules={quillModules}
          className="mt-1 bg-white"
        />
      </div>
      <div>
        <Label className="font-medium text-stone-700">Helpful Links</Label>
        <div className="space-y-2 mt-1">
          {(goalData.links || []).map((link, index) => (
            <div key={index} className="flex items-end gap-2">
              <div className="flex-1">
                <Label className="text-xs text-stone-600">Link Title</Label>
                <Input
                  placeholder="e.g., Sleep Hygiene Guide"
                  value={link.title}
                  onChange={(e) => handleLinkChange(index, 'title', e.target.value)}
                  className="mt-1 border-sage-200 h-9"
                />
              </div>
              <div className="flex-1">
                <Label className="text-xs text-stone-600">URL</Label>
                <Input
                  placeholder="https://example.com"
                  value={link.url}
                  onChange={(e) => handleLinkChange(index, 'url', e.target.value)}
                  className="mt-1 border-sage-200 h-9"
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeLink(index)}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <Button
            onClick={addLink}
            variant="outline"
            size="sm"
            className="border-sage-200 text-sage-700 hover:bg-sage-50"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Link
          </Button>
        </div>
      </div>
    </div>
  );
}