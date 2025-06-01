import type { LocationReport, ReportedLocation, TopContributor, DatabaseStats } from '../types/game';

// Use environment variable or default to relative path for k8s
const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || '/api';

// API Service for backend communication
export class ApiService {
  private static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Get all active location reports
  static async getLocations(buildingType?: string, limit = 100): Promise<ReportedLocation[]> {
    const params = new URLSearchParams();
    if (buildingType) params.append('building_type', buildingType);
    params.append('limit', limit.toString());

    const data = await this.request<Array<{
      id: number;
      building_name: string;
      building_type: 'shop' | 'guild' | 'hunter' | 'paladin' | 'werewolf' | 'item';
      custom_item_name?: string;
      coordinate_x: number;
      coordinate_y: number;
      street_name?: string;
      street_number?: string;
      guild_level?: 1 | 2 | 3;
      reporter_username?: string;
      confidence: 'confirmed' | 'unverified';
      notes?: string;
      reported_at: string;
      expires_at?: string;
    }>>(`/api/locations?${params.toString()}`);

    // Transform database format to frontend format
    return data.map(item => ({
      id: item.id.toString(),
      buildingName: item.building_name,
      buildingType: item.building_type,
      customItemName: item.custom_item_name,
      coordinate: { x: item.coordinate_x, y: item.coordinate_y },
      reportedAt: new Date(item.reported_at),
      reporterName: item.reporter_username,
      confidence: item.confidence,
      notes: item.notes,
      guildLevel: item.guild_level,
      expiresAt: item.expires_at ? new Date(item.expires_at) : undefined,
    }));
  }

  // Create a new location report
  static async createLocation(report: LocationReport): Promise<ReportedLocation> {
    const data = await this.request<{
      id: number;
      building_name: string;
      building_type: 'shop' | 'guild' | 'hunter' | 'paladin' | 'werewolf' | 'item';
      custom_item_name?: string;
      coordinate_x: number;
      coordinate_y: number;
      street_name?: string;
      street_number?: string;
      guild_level?: 1 | 2 | 3;
      reporter_username?: string;
      confidence: 'confirmed' | 'unverified';
      notes?: string;
      reported_at: string;
      expires_at?: string;
    }>('/api/locations', {
      method: 'POST',
      body: JSON.stringify({
        building_name: report.buildingName,
        building_type: report.buildingType,
        custom_item_name: report.customItemName,
        coordinate_x: report.coordinate?.x,
        coordinate_y: report.coordinate?.y,
        street_name: report.streetName,
        street_number: report.streetNumber,
        guild_level: report.guildLevel,
        reporter_username: report.reporterName,
        notes: report.notes,
      }),
    });

    // Transform database format to frontend format
    return {
      id: data.id.toString(),
      buildingName: data.building_name,
      buildingType: data.building_type,
      customItemName: data.custom_item_name,
      coordinate: { x: data.coordinate_x, y: data.coordinate_y },
      reportedAt: new Date(data.reported_at),
      reporterName: data.reporter_username,
      confidence: data.confidence,
      notes: data.notes,
      guildLevel: data.guild_level,
      expiresAt: data.expires_at ? new Date(data.expires_at) : undefined,
    };
  }

  // Update location confidence
  static async updateLocationConfidence(
    id: string,
    confidence: 'confirmed' | 'unverified'
  ): Promise<ReportedLocation> {
    const data = await this.request<{
      id: number;
      building_name: string;
      building_type: 'shop' | 'guild' | 'hunter' | 'paladin' | 'werewolf' | 'item';
      custom_item_name?: string;
      coordinate_x: number;
      coordinate_y: number;
      guild_level?: 1 | 2 | 3;
      reporter_username?: string;
      confidence: 'confirmed' | 'unverified';
      notes?: string;
      reported_at: string;
      expires_at?: string;
    }>(`/api/locations/${id}/confidence`, {
      method: 'PATCH',
      body: JSON.stringify({ confidence }),
    });

    return {
      id: data.id.toString(),
      buildingName: data.building_name,
      buildingType: data.building_type,
      customItemName: data.custom_item_name,
      coordinate: { x: data.coordinate_x, y: data.coordinate_y },
      reportedAt: new Date(data.reported_at),
      reporterName: data.reporter_username,
      confidence: data.confidence,
      notes: data.notes,
      guildLevel: data.guild_level,
      expiresAt: data.expires_at ? new Date(data.expires_at) : undefined,
    };
  }

  // Delete a location report
  static async deleteLocation(id: string): Promise<void> {
    await this.request(`/api/locations/${id}`, {
      method: 'DELETE',
    });
  }

  // Get top contributors
  static async getTopContributors(limit = 10): Promise<TopContributor[]> {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());

    const data = await this.request<Array<{
      username: string;
      total_reports: number;
      created_at: string;
      rank: number;
    }>>(`/api/contributors?${params.toString()}`);

    return data.map(item => ({
      username: item.username,
      total_reports: item.total_reports,
      created_at: new Date(item.created_at),
      rank: item.rank,
    }));
  }

  // Get database statistics
  static async getStats(): Promise<DatabaseStats> {
    return this.request<DatabaseStats>('/api/stats');
  }

  // Manual cleanup of expired reports
  static async cleanup(): Promise<{ message: string; expired_count: number }> {
    return this.request<{ message: string; expired_count: number }>('/api/cleanup', {
      method: 'POST',
    });
  }

  // Health check
  static async healthCheck(): Promise<{ status: string; timestamp: string; database: string }> {
    return this.request<{ status: string; timestamp: string; database: string }>('/health');
  }
}