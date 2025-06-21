import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Plus, Trash2, Calendar, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'bank';
  last4?: string;
  brand?: string;
  expiryDate?: string;
  email?: string;
  bankName?: string;
  isDefault: boolean;
}

const PaymentMethods = () => {
  const { toast } = useToast();
  const [showAddForm, setShowAddForm] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      type: 'card',
      last4: '4242',
      brand: 'Visa',
      expiryDate: '12/25',
      isDefault: true
    },
    {
      id: '2',
      type: 'paypal',
      email: 'user@example.com',
      isDefault: false
    }
  ]);

  const [newPaymentMethod, setNewPaymentMethod] = useState({
    type: 'card' as 'card' | 'paypal' | 'bank',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    name: '',
    email: '',
    bankName: '',
    accountNumber: ''
  });

  const handleAddPaymentMethod = () => {
    const newMethod: PaymentMethod = {
      id: Date.now().toString(),
      type: newPaymentMethod.type,
      isDefault: paymentMethods.length === 0
    };

    if (newPaymentMethod.type === 'card') {
      newMethod.last4 = newPaymentMethod.cardNumber.slice(-4);
      newMethod.brand = 'Visa'; // Mock brand detection
      newMethod.expiryDate = newPaymentMethod.expiryDate;
    } else if (newPaymentMethod.type === 'paypal') {
      newMethod.email = newPaymentMethod.email;
    } else if (newPaymentMethod.type === 'bank') {
      newMethod.bankName = newPaymentMethod.bankName;
      newMethod.last4 = newPaymentMethod.accountNumber.slice(-4);
    }

    setPaymentMethods([...paymentMethods, newMethod]);
    setNewPaymentMethod({
      type: 'card',
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      name: '',
      email: '',
      bankName: '',
      accountNumber: ''
    });
    setShowAddForm(false);
    
    toast({
      title: "Payment method added",
      description: "Your new payment method has been saved successfully.",
    });
  };

  const handleDeletePaymentMethod = (id: string) => {
    setPaymentMethods(paymentMethods.filter(method => method.id !== id));
    toast({
      title: "Payment method removed",
      description: "The payment method has been deleted.",
    });
  };

  const handleSetDefault = (id: string) => {
    setPaymentMethods(paymentMethods.map(method => ({
      ...method,
      isDefault: method.id === id
    })));
    toast({
      title: "Default payment method updated",
      description: "Your default payment method has been changed.",
    });
  };

  const getPaymentMethodIcon = (type: string) => {
    switch (type) {
      case 'card':
        return <CreditCard className="h-5 w-5" />;
      case 'paypal':
        return <div className="h-5 w-5 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">P</div>;
      case 'bank':
        return <div className="h-5 w-5 bg-green-600 rounded text-white text-xs flex items-center justify-center font-bold">B</div>;
      default:
        return <CreditCard className="h-5 w-5" />;
    }
  };

  const renderPaymentMethodDetails = (method: PaymentMethod) => {
    switch (method.type) {
      case 'card':
        return (
          <div>
            <p className="font-medium">{method.brand} •••• {method.last4}</p>
            <p className="text-sm text-gray-600">Expires {method.expiryDate}</p>
          </div>
        );
      case 'paypal':
        return (
          <div>
            <p className="font-medium">PayPal</p>
            <p className="text-sm text-gray-600">{method.email}</p>
          </div>
        );
      case 'bank':
        return (
          <div>
            <p className="font-medium">{method.bankName}</p>
            <p className="text-sm text-gray-600">•••• {method.last4}</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-500" />
            Payment Methods
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Method
          </Button>
        </div>
        <CardDescription>
          Manage your payment methods for subscription billing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Existing Payment Methods */}
        {paymentMethods.map((method) => (
          <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              {getPaymentMethodIcon(method.type)}
              {renderPaymentMethodDetails(method)}
              {method.isDefault && (
                <Badge variant="secondary" className="ml-2">Default</Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {!method.isDefault && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleSetDefault(method.id)}
                >
                  Set Default
                </Button>
              )}
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handleDeletePaymentMethod(method.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}

        {/* Add New Payment Method Form */}
        {showAddForm && (
          <div className="border rounded-lg p-4 space-y-4 bg-gray-50">
            <h4 className="font-medium">Add New Payment Method</h4>
            
            <div className="space-y-2">
              <Label>Payment Type</Label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md"
                value={newPaymentMethod.type}
                onChange={(e) => setNewPaymentMethod({ 
                  ...newPaymentMethod, 
                  type: e.target.value as 'card' | 'paypal' | 'bank' 
                })}
              >
                <option value="card">Credit/Debit Card</option>
                <option value="paypal">PayPal</option>
                <option value="bank">Bank Account</option>
              </select>
            </div>

            {newPaymentMethod.type === 'card' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Card Number</Label>
                    <Input
                      placeholder="1234 5678 9012 3456"
                      value={newPaymentMethod.cardNumber}
                      onChange={(e) => setNewPaymentMethod({ 
                        ...newPaymentMethod, 
                        cardNumber: e.target.value 
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Cardholder Name</Label>
                    <Input
                      placeholder="John Doe"
                      value={newPaymentMethod.name}
                      onChange={(e) => setNewPaymentMethod({ 
                        ...newPaymentMethod, 
                        name: e.target.value 
                      })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Expiry Date</Label>
                    <Input
                      placeholder="MM/YY"
                      value={newPaymentMethod.expiryDate}
                      onChange={(e) => setNewPaymentMethod({ 
                        ...newPaymentMethod, 
                        expiryDate: e.target.value 
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>CVV</Label>
                    <Input
                      placeholder="123"
                      type="password"
                      value={newPaymentMethod.cvv}
                      onChange={(e) => setNewPaymentMethod({ 
                        ...newPaymentMethod, 
                        cvv: e.target.value 
                      })}
                    />
                  </div>
                </div>
              </>
            )}

            {newPaymentMethod.type === 'paypal' && (
              <div className="space-y-2">
                <Label>PayPal Email</Label>
                <Input
                  type="email"
                  placeholder="your-email@example.com"
                  value={newPaymentMethod.email}
                  onChange={(e) => setNewPaymentMethod({ 
                    ...newPaymentMethod, 
                    email: e.target.value 
                  })}
                />
              </div>
            )}

            {newPaymentMethod.type === 'bank' && (
              <>
                <div className="space-y-2">
                  <Label>Bank Name</Label>
                  <Input
                    placeholder="Your Bank Name"
                    value={newPaymentMethod.bankName}
                    onChange={(e) => setNewPaymentMethod({ 
                      ...newPaymentMethod, 
                      bankName: e.target.value 
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Account Number</Label>
                  <Input
                    placeholder="1234567890"
                    value={newPaymentMethod.accountNumber}
                    onChange={(e) => setNewPaymentMethod({ 
                      ...newPaymentMethod, 
                      accountNumber: e.target.value 
                    })}
                  />
                </div>
              </>
            )}

            <div className="flex gap-2">
              <Button onClick={handleAddPaymentMethod}>
                Add Payment Method
              </Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {paymentMethods.length === 0 && !showAddForm && (
          <div className="text-center py-8 text-gray-500">
            <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No payment methods added yet</p>
            <p className="text-sm">Add a payment method to manage your subscription</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentMethods;
