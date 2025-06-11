import type React from 'react';
import { useState } from 'react';
import styled from 'styled-components';
import { ApiService } from '../services/api';
import {
  SHOP_NAMES,
  GUILD_NAMES,
  parseNaturalLanguageLocation,
  parseLocationToCoordinate
} from '../data/reportedLocations';
import { STREET_NAMES } from '../data/cityData';
import type { LocationReport, ReportedLocation } from '../types/game';

const ReporterContainer = styled.div`
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 8px;
  padding: 20px;
  margin: 20px 0;
  max-width: 600px;
`;

const ReporterTitle = styled.h3`
  color: #cc3333;
  margin-bottom: 20px;
  text-align: center;
`;

const TabContainer = styled.div`
  display: flex;
  margin-bottom: 20px;
  border-bottom: 1px solid #333;
`;

const Tab = styled.button<{ active: boolean }>`
  background: ${props => props.active ? '#333' : 'transparent'};
  color: ${props => props.active ? '#fff' : '#ccc'};
  border: none;
  padding: 10px 20px;
  cursor: pointer;
  border-bottom: 2px solid ${props => props.active ? '#cc3333' : 'transparent'};

  &:hover {
    background: #333;
    color: #fff;
  }
`;

const FormSection = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  color: #ccc;
  margin-bottom: 5px;
  font-weight: bold;
`;

const Select = styled.select`
  width: 100%;
  padding: 8px;
  background: #000;
  color: #fff;
  border: 1px solid #333;
  border-radius: 4px;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: #cc3333;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 8px;
  background: #000;
  color: #fff;
  border: 1px solid #333;
  border-radius: 4px;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: #cc3333;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 60px;
  padding: 8px;
  background: #000;
  color: #fff;
  border: 1px solid #333;
  border-radius: 4px;
  font-family: inherit;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #cc3333;
  }
`;

const FormRow = styled.div`
  display: flex;
  gap: 15px;

  > div {
    flex: 1;
  }
`;

const SubmitButton = styled.button`
  background: #cc3333;
  color: #fff;
  border: none;
  padding: 12px 30px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  width: 100%;

  &:hover {
    background: #aa2222;
  }

  &:disabled {
    background: #666;
    cursor: not-allowed;
  }
`;

const ExampleText = styled.div`
  color: #888;
  font-size: 0.9em;
  margin-top: 5px;
  font-style: italic;
`;

const SuccessMessage = styled.div`
  background: #1a4a1a;
  color: #4afa4a;
  padding: 10px;
  border-radius: 4px;
  margin-top: 10px;
  text-align: center;
`;

const ErrorMessage = styled.div`
  background: #4a1a1a;
  color: #fa4a4a;
  padding: 10px;
  border-radius: 4px;
  margin-top: 10px;
  text-align: center;
`;

interface LocationReporterProps {
  onLocationReported?: (location: ReportedLocation) => void;
}

export const LocationReporter: React.FC<LocationReporterProps> = ({ onLocationReported }) => {
  const [activeTab, setActiveTab] = useState<'dropdown' | 'text'>('dropdown');
  const [buildingType, setBuildingType] = useState<'shop' | 'guild' | 'hunter' | 'paladin' | 'werewolf' | 'item' | 'blood_deity' | 'rich_vampire'>('shop');
  const [buildingName, setBuildingName] = useState('');
  const [customItemName, setCustomItemName] = useState('');
  const [streetName, setStreetName] = useState('');
  const [streetNumber, setStreetNumber] = useState('');
  const [reporterName, setReporterName] = useState('');
  const [notes, setNotes] = useState('');
  const [guildLevel, setGuildLevel] = useState<1 | 2 | 3>(1);
  const [bloodAmount, setBloodAmount] = useState<number>(0);
  const [coins, setCoins] = useState<number>(0);
  const [naturalLanguageInput, setNaturalLanguageInput] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const getFilteredBuildingNames = () => {
    if (buildingType === 'shop') {
      return [...SHOP_NAMES].sort();
    }
    if (buildingType === 'guild') {
      return GUILD_NAMES.sort();
    }
    // For hunter, paladin, werewolf, we'll use generic names or allow custom input
    if (buildingType === 'hunter') {
      return ['Vampire Hunter', 'Hunter\'s Den', 'Hunter Sanctuary'];
    }
    if (buildingType === 'paladin') {
      return ['Paladin Hall', 'Holy Sanctuary', 'Paladin Order'];
    }
    if (buildingType === 'werewolf') {
      return ['Werewolf Pack', 'Wolf Den', 'Werewolf Territory'];
    }
    if (buildingType === 'item') {
      return ['Special Item']; // This will use custom item name
    }
    if (buildingType === 'blood_deity' || buildingType === 'rich_vampire') {
      return []; // These will use custom names/vampire names
    }
    return [];
  };

  // Helper function to get correct ordinal suffix
  const getOrdinalSuffix = (num: number): string => {
    const lastDigit = num % 10;
    const lastTwoDigits = num % 100;

    // Handle special cases: 11th, 12th, 13th
    if (lastTwoDigits >= 11 && lastTwoDigits <= 13) {
      return 'th';
    }

    // Handle regular cases
    switch (lastDigit) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };

  const streetNumbers = Array.from({ length: 100 }, (_, i) => {
    const num = i + 1;
    return `${num}${getOrdinalSuffix(num)}`;
  });

  const clearMessages = () => {
    setSuccessMessage('');
    setErrorMessage('');
  };

  const resetForm = () => {
    setBuildingName('');
    setCustomItemName('');
    setStreetName('');
    setStreetNumber('');
    setReporterName('');
    setNotes('');
    setGuildLevel(1);
    setBloodAmount(0);
    setCoins(0);
    setNaturalLanguageInput('');
  };

  const handleBuildingTypeChange = (newType: 'shop' | 'guild' | 'hunter' | 'paladin' | 'werewolf' | 'item' | 'blood_deity' | 'rich_vampire') => {
    setBuildingType(newType);
    setBuildingName('');
    setCustomItemName('');
    clearMessages();
  };

  const handleDropdownSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    console.log('🚀 Form submission started (dropdown)', {
      buildingName,
      buildingType,
      streetName,
      streetNumber,
      customItemName,
      reporterName,
      guildLevel,
      bloodAmount,
      coins,
      notes
    });

    // Handle Blood Deity and Rich Vampire separately
    if (buildingType === 'blood_deity') {
      if (!buildingName || bloodAmount <= 0) {
        setErrorMessage('Please enter a vampire name and blood amount.');
        return;
      }

      try {
        await ApiService.submitBloodDeity(buildingName, bloodAmount, reporterName || undefined);
        setSuccessMessage(`Successfully reported ${buildingName} as a Blood Deity with ${bloodAmount} pints!`);
        resetForm();
        onLocationReported?.({} as ReportedLocation); // Trigger refresh
        return;
      } catch (error) {
        console.error('❌ Blood deity submission failed:', error);
        setErrorMessage('Error submitting blood deity. Please try again.');
        return;
      }
    }

    if (buildingType === 'rich_vampire') {
      if (!buildingName) {
        setErrorMessage('Please enter a vampire name.');
        return;
      }

      try {
        await ApiService.submitRichVampire(buildingName, reporterName || undefined);
        setSuccessMessage(`Successfully reported ${buildingName} as a Rich Vampire!`);
        resetForm();
        onLocationReported?.({} as ReportedLocation); // Trigger refresh
        return;
      } catch (error) {
        console.error('❌ Rich vampire submission failed:', error);
        setErrorMessage('Error submitting rich vampire. Please try again.');
        return;
      }
    }

    // Regular location reporting logic for other building types
    // For hunter/paladin/werewolf, use the type as the building name
    const effectiveBuildingName = ['hunter', 'paladin', 'werewolf'].includes(buildingType)
      ? buildingType.charAt(0).toUpperCase() + buildingType.slice(1)
      : buildingName;

    if (!effectiveBuildingName || !streetName || !streetNumber) {
      console.log('❌ Form validation failed - missing required fields');
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    if (buildingType === 'item' && !customItemName) {
      console.log('❌ Form validation failed - missing custom item name');
      setErrorMessage('Please enter a custom item name.');
      return;
    }

    try {
      // Calculate coordinates from street name and number
      const coordinate = parseLocationToCoordinate(streetName, streetNumber);
      console.log('📍 Calculated coordinates:', coordinate);

      const report: LocationReport = {
        buildingName: effectiveBuildingName,
        buildingType,
        customItemName: buildingType === 'item' ? customItemName : undefined,
        streetName,
        streetNumber,
        coordinate,
        reporterName: reporterName || undefined,
        notes: notes || undefined,
        guildLevel: buildingType === 'guild' ? guildLevel : undefined,
        bloodAmount,
        coins
      };

      console.log('📤 Sending API request with data:', report);
      const reportedLocation = await ApiService.createLocation(report);
      console.log('✅ API request successful:', reportedLocation);

      setSuccessMessage(`Successfully reported ${effectiveBuildingName} at ${streetName} & ${streetNumber}!`);
      resetForm();
      onLocationReported?.(reportedLocation);
    } catch (error) {
      console.error('❌ API request failed:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        buildingName,
        buildingType,
        streetName,
        streetNumber
      });
      setErrorMessage('Error submitting report. Please try again.');
    }
  };

  const handleNaturalLanguageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    console.log('🚀 Form submission started (natural language)', {
      naturalLanguageInput,
      reporterName,
      notes
    });

    if (!naturalLanguageInput.trim()) {
      console.log('❌ Form validation failed - empty natural language input');
      setErrorMessage('Please enter a location description.');
      return;
    }

    try {
      // Split input by newlines and filter out empty lines
      const locationLines = naturalLanguageInput
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);

      console.log(`🔍 Processing ${locationLines.length} location(s)`);

      // Parse comma-separated reporter names
      const reporterNames = reporterName
        ? reporterName.split(',').map(name => name.trim()).filter(name => name.length > 0)
        : [];

      console.log('👥 Reporter names:', reporterNames);

      const results: { success: number; failed: number; details: string[] } = {
        success: 0,
        failed: 0,
        details: []
      };

      // Process each location
      for (const [index, locationLine] of locationLines.entries()) {
        console.log(`🔍 Processing location ${index + 1}/${locationLines.length}: ${locationLine}`);

        try {
          const parsedReport = parseNaturalLanguageLocation(locationLine);

          if (!parsedReport) {
            console.log(`❌ Natural language parsing failed for: ${locationLine}`);
            results.failed++;
            results.details.push(`❌ Could not parse: "${locationLine}"`);
            continue;
          }

          // Cycle through reporter names or use single name
          const currentReporterName = reporterNames.length > 0
            ? reporterNames[index % reporterNames.length]
            : undefined;

          console.log(`📝 Using reporter name: ${currentReporterName || 'anonymous'}`);

          const report: LocationReport = {
            ...parsedReport,
            coordinate: parsedReport.coordinate || parseLocationToCoordinate(parsedReport.streetName, parsedReport.streetNumber),
            reporterName: currentReporterName,
            notes: notes || undefined,
            bloodAmount,
            coins
          };

          console.log(`📤 Sending API request for: ${parsedReport.buildingName}`, report);
          const reportedLocation = await ApiService.createLocation(report);
          console.log(`✅ Successfully reported: ${parsedReport.buildingName}`);

          results.success++;
          results.details.push(`✅ ${parsedReport.buildingName} at ${parsedReport.streetName} & ${parsedReport.streetNumber} (by ${currentReporterName || 'anonymous'})`);

          if (onLocationReported) {
            // Trigger the callback to refresh the listings
            onLocationReported(reportedLocation);
          }

        } catch (error) {
          console.error(`❌ API request failed for: ${locationLine}`, error);
          const errorMsg = error instanceof Error ? error.message : 'Unknown error';
          results.failed++;
          results.details.push(`❌ Failed to report: "${locationLine}" - ${errorMsg}`);
        }
      }

      // Show summary message
      if (results.success > 0 && results.failed === 0) {
        setSuccessMessage(`Successfully reported ${results.success} location${results.success > 1 ? 's' : ''}!`);
        resetForm();
      } else if (results.success > 0 && results.failed > 0) {
        setSuccessMessage(`Reported ${results.success} location${results.success > 1 ? 's' : ''}, ${results.failed} failed.`);
        setErrorMessage(`Some locations failed to parse. Check details in console.`);
        console.log('📊 Batch processing results:', results);
      } else {
        setErrorMessage(`Failed to report any locations. Check the format and try again.`);
        console.log('📊 Detailed failure reasons:', results.details);
      }

    } catch (error) {
      console.error('❌ Batch processing failed:', error);
      setErrorMessage('Error processing locations. Please try again.');
    }
  };

  return (
    <ReporterContainer>
      <ReporterTitle>Report!</ReporterTitle>

      <TabContainer>
        <Tab
          active={activeTab === 'dropdown'}
          onClick={() => setActiveTab('dropdown')}
        >
          Dropdown Selection
        </Tab>
        <Tab
          active={activeTab === 'text'}
          onClick={() => setActiveTab('text')}
        >
          Text Input
        </Tab>
      </TabContainer>

      {activeTab === 'dropdown' && (
        <form onSubmit={handleDropdownSubmit}>
          <FormSection>
            <Label>Building Type</Label>
            <Select
              value={buildingType}
              onChange={(e) => handleBuildingTypeChange(e.target.value as 'shop' | 'guild' | 'hunter' | 'paladin' | 'werewolf' | 'item' | 'blood_deity' | 'rich_vampire')}
            >
              <option value="shop">Shop</option>
              <option value="guild">Guild</option>
              <option value="hunter">Hunter</option>
              <option value="paladin">Paladin</option>
              <option value="werewolf">Werewolf</option>
              <option value="item">Item</option>
              <option value="blood_deity">Blood Deity</option>
              <option value="rich_vampire">Rich Vampire</option>
            </Select>
          </FormSection>

          {!['hunter', 'paladin', 'werewolf', 'blood_deity', 'rich_vampire'].includes(buildingType) && (
            <FormSection>
              <Label>Building Name *</Label>
              <Select
                value={buildingName}
                onChange={(e) => setBuildingName(e.target.value)}
                required
              >
                <option value="">Select a building...</option>
                {getFilteredBuildingNames().map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </Select>
            </FormSection>
          )}

          {buildingType === 'guild' && (
            <FormSection>
              <Label>Guild Level</Label>
              <Select
                value={guildLevel}
                onChange={(e) => setGuildLevel(parseInt(e.target.value) as 1 | 2 | 3)}
              >
                <option value={1}>Level 1</option>
                <option value={2}>Level 2</option>
                <option value={3}>Level 3</option>
              </Select>
            </FormSection>
          )}

          {buildingType === 'item' && (
            <FormSection>
              <Label>Item Name *</Label>
              <Input
                type="text"
                value={customItemName}
                onChange={(e) => setCustomItemName(e.target.value)}
                placeholder="Enter the item name..."
                required
              />
            </FormSection>
          )}

          {(buildingType === 'blood_deity' || buildingType === 'rich_vampire') && (
            <FormSection>
              <Label>Vampire Name *</Label>
              <Input
                type="text"
                value={buildingName}
                onChange={(e) => setBuildingName(e.target.value)}
                placeholder="Enter the vampire's name..."
                required
              />
            </FormSection>
          )}

          {buildingType === 'blood_deity' && (
            <FormSection>
              <Label>Blood Amount (pints) *</Label>
              <Input
                type="number"
                value={bloodAmount}
                onChange={(e) => setBloodAmount(parseInt(e.target.value) || 0)}
                placeholder="Enter blood amount..."
                min="0"
                required
              />
            </FormSection>
          )}

          {/* Rich Vampires don't report coin amounts - just vampire names */}

          {!['blood_deity', 'rich_vampire'].includes(buildingType) && (
            <FormRow>
              <FormSection>
                <Label>Street Name *</Label>
                <Select
                  value={streetName}
                  onChange={(e) => setStreetName(e.target.value)}
                  required
                >
                  <option value="">Select a street...</option>
                  <option value="Western City Limits">Western City Limits</option>
                  {STREET_NAMES.map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </Select>
              </FormSection>

              <FormSection>
                <Label>Street Number *</Label>
                <Select
                  value={streetNumber}
                  onChange={(e) => setStreetNumber(e.target.value)}
                  required
                >
                  <option value="">Select number...</option>
                  <option value="Northern City Limits">Northern City Limits</option>
                  {streetNumbers.map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </Select>
              </FormSection>
            </FormRow>
          )}

          <FormSection>
            <Label>Your Name (optional)</Label>
            <Input
              type="text"
              value={reporterName}
              onChange={(e) => setReporterName(e.target.value)}
              placeholder="Reporter name"
            />
          </FormSection>

          <FormSection>
            <Label>Notes (optional)</Label>
            <TextArea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes about the location"
            />
          </FormSection>

          <SubmitButton type="submit">Report Location</SubmitButton>
        </form>
      )}

      {activeTab === 'text' && (
        <form onSubmit={handleNaturalLanguageSubmit}>
          <FormSection>
            <Label>Location Description *</Label>
            <TextArea
              value={naturalLanguageInput}
              onChange={(e) => setNaturalLanguageInput(e.target.value)}
              placeholder="e.g., Paper and Scrolls, right by Regret and 90th
Discount Magic, right by Lonely and 65th
Thieves Guild at Fear and 23rd
Discount Scrolls, right by Chagrin and the NCL
Some Shop, right by the WCL and 50th"
              required
            />
            <ExampleText>
              Enter one or more locations, one per line. Examples: "Discount Magic, right by Lonely and 65th" or "Thieves Guild at Fear and 23rd". Use "NCL" for Northern City Limits and "WCL" for Western City Limits.
            </ExampleText>
          </FormSection>

          <FormSection>
            <Label>Your Name (optional)</Label>
            <Input
              type="text"
              value={reporterName}
              onChange={(e) => setReporterName(e.target.value)}
              placeholder="Reporter name"
            />
          </FormSection>

          <FormSection>
            <Label>Notes (optional)</Label>
            <TextArea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes about the location"
            />
          </FormSection>

          <SubmitButton type="submit">Report Location</SubmitButton>
        </form>
      )}

      {successMessage && <SuccessMessage>{successMessage}</SuccessMessage>}
      {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
    </ReporterContainer>
  );
};