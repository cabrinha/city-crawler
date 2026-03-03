import { useState, useEffect } from 'react';
import styled from 'styled-components';
import type { ShopItem } from '../types/game';

const PageContainer = styled.div`
  width: 100%;
  height: 100vh;
  background-color: #000;
  color: #fff;
  font-family: 'Courier New', monospace;
  padding: 70px 20px 20px;
  overflow-y: auto;
`;

const ContentContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 20px;
  }
`;

const Section = styled.div`
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid #666;
  border-radius: 8px;
  padding: 20px;
`;

const SectionTitle = styled.h2`
  margin: 0 0 20px 0;
  color: #00ff00;
  font-size: 18px;
  border-bottom: 1px solid #666;
  padding-bottom: 10px;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  color: #ccc;
  margin-bottom: 8px;
  font-weight: bold;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  border: 1px solid #666;
  border-radius: 4px;
  font-size: 14px;
  font-family: 'Courier New', monospace;

  &:focus {
    outline: none;
    border-color: #00ff00;
    box-shadow: 0 0 5px rgba(0, 255, 0, 0.3);
  }

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  &[type=number] {
    -moz-appearance: textfield;
  }
`;


const Checkbox = styled.input`
  margin-right: 10px;
  transform: scale(1.2);
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #ccc;
  cursor: pointer;
  margin-bottom: 0;

  &:hover {
    color: #fff;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  flex: 1;
  padding: 8px 12px;
  background-color: ${props => props.$variant === 'primary' ? '#00ff00' : 'rgba(0, 0, 0, 0.8)'};
  color: ${props => props.$variant === 'primary' ? '#000' : 'white'};
  border: 1px solid ${props => props.$variant === 'primary' ? '#00ff00' : '#666'};
  border-radius: 4px;
  cursor: pointer;
  font-size: 11px;
  font-weight: ${props => props.$variant === 'primary' ? 'bold' : 'normal'};

  &:hover {
    background-color: ${props => props.$variant === 'primary' ? '#00cc00' : 'rgba(0, 0, 0, 0.9)'};
    border-color: ${props => props.$variant === 'primary' ? '#00cc00' : '#999'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;


const HelpText = styled.div`
  font-size: 12px;
  color: #999;
  margin-top: 5px;
  line-height: 1.4;
`;

const ItemList = styled.div`
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #666;
  border-radius: 4px;
  background-color: rgba(0, 0, 0, 0.8);

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.5);
  }
`;

const ItemRow = styled.div<{ $selected?: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #444;
  cursor: pointer;
  background-color: ${props => props.$selected ? 'rgba(0, 255, 0, 0.2)' : 'transparent'};
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${props => props.$selected ? 'rgba(0, 255, 0, 0.3)' : 'rgba(255, 255, 255, 0.1)'};
  }

  &:last-child {
    border-bottom: none;
  }
`;

const ItemName = styled.span`
  color: #fff;
  font-weight: bold;
`;

const ItemCategory = styled.span`
  color: #999;
  font-size: 12px;
  text-transform: uppercase;
`;

const ItemPrice = styled.span`
  color: #00ff00;
  font-weight: bold;
`;

const ItemDetails = styled.div`
  flex: 1;
`;

const ItemControls = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const QuantityInput = styled.input`
  width: 60px;
  padding: 5px;
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  border: 1px solid #666;
  border-radius: 4px;
  font-size: 12px;
  font-family: 'Courier New', monospace;
  text-align: center;

  &:focus {
    outline: none;
    border-color: #00ff00;
    box-shadow: 0 0 3px rgba(0, 255, 0, 0.3);
  }

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  &[type=number] {
    -moz-appearance: textfield;
  }
`;

const TotalCostDisplay = styled.div`
  background: linear-gradient(135deg, #00ff00, #00cc00);
  color: #000;
  padding: 20px;
  border-radius: 8px;
  margin-top: 20px;
  text-align: center;
`;

const BankWithdrawalAmount = styled.div`
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
`;

const TotalBreakdown = styled.div`
  font-size: 14px;
  opacity: 0.8;
`;

const SummarySection = styled.div`
  background: linear-gradient(135deg, rgba(0, 255, 0, 0.05), rgba(0, 200, 0, 0.02));
  border: 1px solid rgba(0, 255, 0, 0.3);
  border-radius: 12px;
  padding: 20px;
  margin-top: 25px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
`;

const SummaryTitle = styled.h3`
  margin: 0 0 18px 0;
  color: #00ff00;
  font-size: 18px;
  font-weight: bold;
  text-align: center;
  border-bottom: 2px solid rgba(0, 255, 0, 0.3);
  padding-bottom: 12px;
  text-shadow: 0 0 8px rgba(0, 255, 0, 0.4);
`;

const SummaryList = styled.div`
  max-height: 300px;
  overflow-y: auto;
  padding-right: 8px;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: linear-gradient(135deg, rgba(0, 255, 0, 0.6), rgba(0, 200, 0, 0.4));
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(135deg, rgba(0, 255, 0, 0.8), rgba(0, 200, 0, 0.6));
  }
`;

const SummaryItem = styled.div`
  display: grid;
  grid-template-columns: 1fr auto auto;
  align-items: center;
  gap: 15px;
  padding: 12px 16px;
  margin-bottom: 8px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.4);
    border-color: rgba(0, 255, 0, 0.3);
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

const SummaryItemName = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const ItemNameText = styled.div`
  font-weight: bold;
  color: #fff;
  font-size: 14px;
  line-height: 1.2;
`;

const ItemCategoryText = styled.div`
  font-size: 10px;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const SummaryQuantityContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
`;

const SummaryQuantity = styled.div`
  color: #00ff00;
  font-weight: bold;
  font-size: 16px;
  text-shadow: 0 0 4px rgba(0, 255, 0, 0.4);
`;

const UnitPriceText = styled.div`
  font-size: 9px;
  color: #666;
  text-align: center;
`;

const SummaryCostContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
`;

const SummaryCost = styled.div`
  color: #fff;
  font-weight: bold;
  font-size: 14px;
  min-width: 70px;
  text-align: right;
`;

const SavingsText = styled.div`
  font-size: 9px;
  color: #00ff00;
  text-align: right;
  opacity: 0.8;
`;

// Shop items based on actual game items (from screenshot)
const SHOP_ITEMS: ShopItem[] = [
  { id: '1', name: 'Perfect Dandelion', basePrice: 31, category: 'misc' },
  { id: '2', name: 'Sprint Potion', basePrice: 94, category: 'consumable' },
  { id: '3', name: 'Scroll of Turning', basePrice: 315, category: 'misc' },
  { id: '4', name: 'Perfect Red Rose', basePrice: 315, category: 'misc' },
  { id: '5', name: 'Scroll of Succour', basePrice: 472, category: 'misc' },
  { id: '6', name: 'Scroll of Bondage', basePrice: 573, category: 'misc' },
  { id: '7', name: 'Garlic Spray', basePrice: 630, category: 'consumable' },
  { id: '8', name: 'Scroll of Displacement', basePrice: 630, category: 'misc' },
  { id: '9', name: 'Perfect Black Orchid', basePrice: 716, category: 'misc' },
  { id: '10', name: 'Scroll of Summoning', basePrice: 945, category: 'misc' },
  { id: '11', name: 'Vial of Holy Water', basePrice: 1260, category: 'consumable' },
  { id: '12', name: 'Scroll of Parentage', basePrice: 2520, category: 'misc' },
  { id: '13', name: 'Wooden Stake', basePrice: 2520, category: 'weapon' },
  { id: '14', name: 'Scroll of Accounting', basePrice: 3150, category: 'misc' },
  { id: '15', name: 'UV Grenade', basePrice: 3150, category: 'weapon' },
  { id: '16', name: 'Scroll of Teleportation', basePrice: 3150, category: 'misc' },
  { id: '17', name: 'Ring of Resistance', basePrice: 12600, category: 'armor' },
  { id: '18', name: 'Diamond Ring', basePrice: 63000, category: 'misc' },
];

export const ShoppingCalculatorPage: React.FC = () => {
  const [charismaLevel, setCharismaLevel] = useState<number>(1);
  const [isDiscountShop, setIsDiscountShop] = useState<boolean>(false);
  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>({});
  const [totalCalculation, setTotalCalculation] = useState<{
    totalOriginalCost: number;
    totalDiscountedCost: number;
    totalSavings: number;
    charismaDiscountPercent: number;
    itemCount: number;
  } | null>(null);

  // Calculate discount based on charisma level
  const getCharismaDiscount = (charisma: number): number => {
    // Charisma discount: 1% per level, max 20%
    return Math.min(charisma, 20) / 100;
  };

  // Calculate discount shop reduction
  const getDiscountShopReduction = (): number => {
    return isDiscountShop ? 0.1 : 0; // 10% discount for discount shops
  };

  const calculateTotalCost = () => {
    const charismaDiscount = getCharismaDiscount(charismaLevel);
    const discountShopReduction = getDiscountShopReduction();

    let totalOriginalCost = 0;
    let totalDiscountedCost = 0;
    let itemCount = 0;

    // Calculate total for all items with quantities
    Object.entries(itemQuantities).forEach(([itemId, quantity]) => {
      if (quantity > 0) {
        const item = SHOP_ITEMS.find(i => i.id === itemId);
        if (item) {
          const originalCost = item.basePrice * quantity;
          // Apply charisma discount first
          const afterCharismaDiscount = originalCost * (1 - charismaDiscount);
          // Apply discount shop reduction to the already discounted price
          const finalCost = afterCharismaDiscount * (1 - discountShopReduction);

          totalOriginalCost += originalCost;
          totalDiscountedCost += finalCost;
          itemCount += quantity;
        }
      }
    });

    const totalSavings = totalOriginalCost - totalDiscountedCost;

    setTotalCalculation({
      totalOriginalCost,
      totalDiscountedCost,
      totalSavings,
      charismaDiscountPercent: charismaDiscount * 100,
      itemCount
    });
  };

  // Auto-calculate when values change
  useEffect(() => {
    calculateTotalCost();
  }, [charismaLevel, isDiscountShop, itemQuantities]);

  const handleQuantityChange = (itemId: string, quantity: number) => {
    setItemQuantities(prev => ({
      ...prev,
      [itemId]: Math.max(0, quantity)
    }));
  };

  const clearAllQuantities = () => {
    setItemQuantities({});
  };

  return (
    <PageContainer>
      <ContentContainer>
        <Section>
          <SectionTitle>Calculator Settings</SectionTitle>

          <FormGroup>
            <Label>Charisma Level</Label>
            <Input
              type="number"
              min="1"
              max="100"
              value={charismaLevel}
              onChange={(e) => setCharismaLevel(parseInt(e.target.value) || 1)}
            />
            <HelpText>
              Higher charisma reduces prices (1% per level, max 20% at level 20)
            </HelpText>
          </FormGroup>

          <FormGroup>
            <CheckboxLabel>
              <Checkbox
                type="checkbox"
                checked={isDiscountShop}
                onChange={(e) => setIsDiscountShop(e.target.checked)}
              />
              Discount Shop (10% additional discount)
            </CheckboxLabel>
          </FormGroup>

          <ButtonGroup>
            <Button onClick={clearAllQuantities}>
              Clear All
            </Button>
          </ButtonGroup>

          {totalCalculation && totalCalculation.itemCount > 0 && (
            <TotalCostDisplay>
              <BankWithdrawalAmount>
                Total Cost: {Math.ceil(totalCalculation.totalDiscountedCost)} coins
              </BankWithdrawalAmount>
              <TotalBreakdown>
                {totalCalculation.itemCount} item{totalCalculation.itemCount !== 1 ? 's' : ''} •
                Original: {totalCalculation.totalOriginalCost.toFixed(0)} coins •
                Savings: {totalCalculation.totalSavings.toFixed(0)} coins
              </TotalBreakdown>
            </TotalCostDisplay>
          )}

          {(!totalCalculation || totalCalculation.itemCount === 0) && (
            <div style={{ textAlign: 'center', padding: '20px', color: '#999', border: '1px solid #666', borderRadius: '8px', marginTop: '20px' }}>
              <p>Enter quantities for items you want to buy</p>
              <p>Total cost will be calculated automatically</p>
            </div>
          )}

          {totalCalculation && totalCalculation.itemCount > 0 && (
            <SummarySection>
              <SummaryTitle>Shopping List Summary</SummaryTitle>
              <SummaryList>
                {Object.entries(itemQuantities)
                  .filter(([_, quantity]) => quantity > 0)
                  .map(([itemId, quantity]) => {
                    const item = SHOP_ITEMS.find(i => i.id === itemId);
                    if (!item) return null;

                    const charismaDiscount = getCharismaDiscount(charismaLevel);
                    const discountShopReduction = getDiscountShopReduction();

                    const originalCost = item.basePrice * quantity;
                    const afterCharismaDiscount = originalCost * (1 - charismaDiscount);
                    const finalCost = afterCharismaDiscount * (1 - discountShopReduction);

                    const savings = originalCost - finalCost;

                    return (
                      <SummaryItem key={itemId}>
                        <SummaryItemName>
                          <ItemNameText>{item.name}</ItemNameText>
                          <ItemCategoryText>{item.category}</ItemCategoryText>
                        </SummaryItemName>

                        <SummaryQuantityContainer>
                          <SummaryQuantity>×{quantity}</SummaryQuantity>
                          <UnitPriceText>{item.basePrice} each</UnitPriceText>
                        </SummaryQuantityContainer>

                        <SummaryCostContainer>
                          <SummaryCost>{Math.ceil(finalCost)} coins</SummaryCost>
                          {savings > 0 && (
                            <SavingsText>-{Math.ceil(savings)} saved</SavingsText>
                          )}
                        </SummaryCostContainer>
                      </SummaryItem>
                    );
                  })}
              </SummaryList>
            </SummarySection>
          )}
        </Section>

        <Section>
          <SectionTitle>Shop Items</SectionTitle>

          <HelpText style={{ marginBottom: '15px' }}>
            Enter the quantity you want to buy for each item
          </HelpText>

          <ItemList>
            {SHOP_ITEMS.map((item) => (
              <ItemRow key={item.id}>
                <ItemDetails>
                  <ItemName>{item.name}</ItemName>
                  <br />
                  <ItemCategory>{item.category}</ItemCategory>
                </ItemDetails>
                <ItemControls>
                  <ItemPrice>{item.basePrice} coins</ItemPrice>
                  <QuantityInput
                    type="number"
                    min="0"
                    max="999"
                    value={itemQuantities[item.id] || 0}
                    onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 0)}
                    placeholder="0"
                  />
                </ItemControls>
              </ItemRow>
            ))}
          </ItemList>
        </Section>
      </ContentContainer>
    </PageContainer>
  );
};
