import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Truck, MapPin, Calendar, Package, DollarSign, Edit } from 'lucide-react';

interface LoadInputProps {
  onLoadAdded: (load: any) => void;
  initialData?: any; // Add this
}

export default function LoadInput({ onLoadAdded, initialData }: LoadInputProps) {
  const [formData, setFormData] = useState({
    id: initialData?.load_number || '',
    pickDate: initialData?.pickup_date || '',
    dropDate: initialData?.delivery_date || '',
    origin: initialData?.origin || '',
    destination: initialData?.destination || '',
    originFacility: initialData?.origin_facility || '',
    destinationFacility: initialData?.destination_facility || '',
    product: initialData?.product_type || '',
    equipment: initialData?.equipment_type || '',
    temp: initialData?.temp || '',
    rate: initialData?.rate || '',
    pallets: initialData?.pallets || '',
    cases: initialData?.cases || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const load = {
      ...formData,
      pallets: parseInt(formData.pallets) || 0,
      cases: parseInt(formData.cases) || 0,
      is_active: true,
      created_at: new Date().toISOString()
    };

    onLoadAdded(load);
    
    // Reset form
    setFormData({
      id: '', pickDate: '', dropDate: '', origin: '', destination: '',
      originFacility: '', destinationFacility: '', product: '', equipment: '',
      temp: '', rate: '', pallets: '', cases: ''
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Load ID - Required */}
      <div>
        <Label htmlFor="id" className="text-xs font-medium">Load ID *</Label>
        <Input
          id="id"
          type="text"
          value={formData.id}
          onChange={(e) => handleInputChange('id', e.target.value)}
          placeholder="LN0012345"
          required
          className="h-8 text-xs"
          autoComplete="off"
        />
      </div>

      {/* Origin - Optional */}
      <div>
        <Label htmlFor="origin" className="text-xs font-medium">Origin</Label>
        <Input
          id="origin"
          type="text"
          value={formData.origin}
          onChange={(e) => handleInputChange('origin', e.target.value)}
          placeholder="Chicago, IL"
          className="h-8 text-xs"
          autoComplete="address-level1"
        />
      </div>

      {/* Destination - Optional */}
      <div>
        <Label htmlFor="destination" className="text-xs font-medium">Destination</Label>
        <Input
          id="destination"
          type="text"
          value={formData.destination}
          onChange={(e) => handleInputChange('destination', e.target.value)}
          placeholder="Los Angeles, CA"
          className="h-8 text-xs"
          autoComplete="address-level1"
        />
      </div>

      {/* Optional Fields */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label htmlFor="pickDate" className="text-xs font-medium">Pickup Date</Label>
          <Input
            id="pickDate"
            type="date"
            value={formData.pickDate}
            onChange={(e) => handleInputChange('pickDate', e.target.value)}
            className="h-8 text-xs"
            autoComplete="off"
          />
        </div>
        <div>
          <Label htmlFor="dropDate" className="text-xs font-medium">Delivery Date</Label>
          <Input
            id="dropDate"
            type="date"
            value={formData.dropDate}
            onChange={(e) => handleInputChange('dropDate', e.target.value)}
            className="h-8 text-xs"
            autoComplete="off"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label htmlFor="equipment" className="text-xs font-medium">Equipment</Label>
          <Input
            id="equipment"
            type="text"
            value={formData.equipment}
            onChange={(e) => handleInputChange('equipment', e.target.value)}
            placeholder="Dry Van"
            className="h-8 text-xs"
            autoComplete="off"
          />
        </div>
        <div>
          <Label htmlFor="product" className="text-xs font-medium">Product</Label>
          <Input
            id="product"
            type="text"
            value={formData.product}
            onChange={(e) => handleInputChange('product', e.target.value)}
            placeholder="General Freight"
            className="h-8 text-xs"
            autoComplete="off"
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end space-x-2 pt-2">
        <Button type="submit" size="sm" className="h-7 px-3 text-xs">
          <Truck className="h-3 w-3 mr-1" />
          Add Load
        </Button>
      </div>
    </form>
  );
}
