import type React from 'react';
import { useState } from 'react';
import styled from 'styled-components';
import {
  SHOP_NAMES,
  GUILD_NAMES,
  SPECIAL_SHOP_NAMES,
  addReportedLocation,
  parseNaturalLanguageLocation
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
  const [buildingType, setBuildingType] = useState<'shop' | 'guild'>('shop');
  const [buildingName, setBuildingName] = useState('');
  const [streetName, setStreetName] = useState('');
  const [streetNumber, setStreetNumber] = useState('');
  const [reporterName, setReporterName] = useState('');
  const [notes, setNotes] = useState('');
  const [guildLevel, setGuildLevel] = useState<1 | 2 | 3>(1);
  const [naturalLanguageInput, setNaturalLanguageInput] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const getFilteredBuildingNames = () => {
    if (buildingType === 'shop') {
      return [...SHOP_NAMES, ...SPECIAL_SHOP_NAMES].sort();
    }
    return GUILD_NAMES.sort();
  };

  const streetNumbers = Array.from({ length: 100 }, (_, i) => {
    const num = i + 1;
    return `${num}${num === 1 ? 'st' : num === 2 ? 'nd' : num === 3 ? 'rd' : 'th'}`;
  });

  const clearMessages = () => {
    setSuccessMessage('');
    setErrorMessage('');
  };

  const resetForm = () => {
    setBuildingName('');
    setStreetName('');
    setStreetNumber('');
    setReporterName('');
    setNotes('');
    setGuildLevel(1);
    setNaturalLanguageInput('');
  };

  const handleBuildingTypeChange = (newType: 'shop' | 'guild') => {
    setBuildingType(newType);
    setBuildingName('');
    clearMessages();
  };

  const handleDropdownSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (!buildingName || !streetName || !streetNumber) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    try {
      const report: LocationReport = {
        buildingName,
        buildingType,
        streetName,
        streetNumber,
        reporterName: reporterName || undefined,
        notes: notes || undefined,
        guildLevel: buildingType === 'guild' ? guildLevel : undefined
      };

      const reportedLocation = addReportedLocation(report);
      setSuccessMessage(`Successfully reported ${buildingName} at ${streetName} & ${streetNumber}!`);
      resetForm();
      onLocationReported?.(reportedLocation);
    } catch (error) {
      setErrorMessage('Error submitting report. Please try again.');
    }
  };

  const handleNaturalLanguageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (!naturalLanguageInput.trim()) {
      setErrorMessage('Please enter a location description.');
      return;
    }

    try {
      const parsedReport = parseNaturalLanguageLocation(naturalLanguageInput);

      if (!parsedReport) {
        setErrorMessage('Could not parse the location description. Please try a format like "Paper and Scrolls, right by Regret and 90th"');
        return;
      }

      const report: LocationReport = {
        ...parsedReport,
        reporterName: reporterName || undefined,
        notes: notes || undefined
      };

      const reportedLocation = addReportedLocation(report);
      setSuccessMessage(`Successfully reported ${parsedReport.buildingName} at ${parsedReport.streetName} & ${parsedReport.streetNumber}!`);
      resetForm();
      onLocationReported?.(reportedLocation);
    } catch (error) {
      setErrorMessage('Error submitting report. Please try again.');
    }
  };

  return (
    <ReporterContainer>
      <ReporterTitle>Report Shop & Guild Locations</ReporterTitle>

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
              onChange={(e) => handleBuildingTypeChange(e.target.value as 'shop' | 'guild')}
            >
              <option value="shop">Shop</option>
              <option value="guild">Guild</option>
            </Select>
          </FormSection>

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

          {buildingType === 'guild' && (
            <FormSection>
              <Label>Guild Level *</Label>
              <Select
                value={guildLevel}
                onChange={(e) => setGuildLevel(Number.parseInt(e.target.value, 10) as 1 | 2 | 3)}
                required
              >
                <option value={1}>Level 1</option>
                <option value={2}>Level 2</option>
                <option value={3}>Level 3</option>
              </Select>
            </FormSection>
          )}

          <FormRow>
            <FormSection>
              <Label>Street Name *</Label>
              <Select
                value={streetName}
                onChange={(e) => setStreetName(e.target.value)}
                required
              >
                <option value="">Select a street...</option>
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
                {streetNumbers.map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </Select>
            </FormSection>
          </FormRow>

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
              placeholder="e.g., Paper and Scrolls, right by Regret and 90th"
              required
            />
            <ExampleText>
              Examples: "Discount Magic, right by Lonely and 65th" or "Thieves Guild at Fear and 23rd"
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