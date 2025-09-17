/**
 * Navigation Routing Tests
 * Unit tests for navigation highlighting and route detection logic
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// Mock expo-router hooks
const mockUsePathname = jest.fn();
const mockUseSegments = jest.fn();
const mockUseRouter = jest.fn();

jest.mock('expo-router', () => ({
  usePathname: () => mockUsePathname(),
  useSegments: () => mockUseSegments(),
  useRouter: () => mockUseRouter(),
}));

// Mock the navigation utilities
const getCurrentRoute = (segments: string[]) => {
  console.log('Raw segments:', segments, 'Segments length:', segments.length);
  
  if (!segments) return '/(home)';
  
  const segmentString = JSON.stringify(segments);
  console.log('Segment string:', segmentString);
  
  // Check for group routes in segments
  if (segmentString.includes('(log)')) return '/(log)';
  if (segmentString.includes('(track)')) return '/(track)';
  if (segmentString.includes('(scan)')) return '/(scan)';
  if (segmentString.includes('(profile)')) return '/(profile)';
  if (segmentString.includes('(home)')) return '/(home)';
  
  // Check for specific page names
  if (segmentString.includes('log')) return '/(log)';
  if (segmentString.includes('track')) return '/(track)';
  if (segmentString.includes('scan')) return '/(scan)';
  if (segmentString.includes('profile')) return '/(profile)';
  
  return '/(home)'; // default fallback
};

const isRouteActive = (route: string, currentRoute: string) => {
  const coreRoute = route.replace(/[()]/g, '').replace(/^\//, '');
  const coreCurrentRoute = currentRoute.replace(/[()]/g, '').replace(/^\//, '');
  
  console.log(`Checking route: ${route} vs current: ${currentRoute}`);
  console.log(`Core comparison: ${coreRoute} vs ${coreCurrentRoute}`);
  
  return coreRoute === coreCurrentRoute;
};

const getActiveIndex = (currentRoute: string) => {
  console.log('🔍 Getting active index for route:', currentRoute);
  
  // Navigation order: Log(0), Track(1), Home(2), Scan(3), Profile(4)
  const routeMap: { [key: string]: number } = {
    '/(log)': 0,
    '/log': 0,
    'log': 0,
    '/(track)': 1,
    '/track': 1,
    'track': 1,
    '/(home)': 2,
    '/': 2,
    'home': 2,
    '/(scan)': 3,
    '/scan': 3,
    'scan': 3,
    '/(profile)': 4,
    '/profile': 4,
    'profile': 4,
  };

  const coreRoute = currentRoute.replace(/[()]/g, '').replace(/^\//, '');
  const index = routeMap[currentRoute] ?? routeMap[coreRoute] ?? 2;
  
  console.log(`📍 Route "${currentRoute}" -> Core: "${coreRoute}" -> Index: ${index}`);
  return index;
};

describe('Navigation Routing System', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCurrentRoute function', () => {
    it('should return /(home) for null segments', () => {
      const result = getCurrentRoute(null as any);
      expect(result).toBe('/(home)');
    });

    it('should return /(home) for empty segments array', () => {
      const result = getCurrentRoute([]);
      expect(result).toBe('/(home)');
    });

    it('should detect (log) group route', () => {
      const segments = ['(log)', 'index'];
      const result = getCurrentRoute(segments);
      expect(result).toBe('/(log)');
    });

    it('should detect (track) group route', () => {
      const segments = ['(track)', 'index'];
      const result = getCurrentRoute(segments);
      expect(result).toBe('/(track)');
    });

    it('should detect (scan) group route', () => {
      const segments = ['(scan)', 'scan'];
      const result = getCurrentRoute(segments);
      expect(result).toBe('/(scan)');
    });

    it('should detect (profile) group route', () => {
      const segments = ['(profile)', 'profile'];
      const result = getCurrentRoute(segments);
      expect(result).toBe('/(profile)');
    });

    it('should detect (home) group route', () => {
      const segments = ['(home)', 'index'];
      const result = getCurrentRoute(segments);
      expect(result).toBe('/(home)');
    });

    it('should detect route by page name without parentheses', () => {
      const segments = ['track'];
      const result = getCurrentRoute(segments);
      expect(result).toBe('/(track)');
    });

    it('should fallback to /(home) for unrecognized segments', () => {
      const segments = ['unknown', 'page'];
      const result = getCurrentRoute(segments);
      expect(result).toBe('/(home)');
    });
  });

  describe('isRouteActive function', () => {
    it('should match exact routes', () => {
      expect(isRouteActive('/(home)', '/(home)')).toBe(true);
      expect(isRouteActive('/(track)', '/(track)')).toBe(true);
      expect(isRouteActive('/(profile)', '/(profile)')).toBe(true);
    });

    it('should match routes with different parentheses formatting', () => {
      expect(isRouteActive('/home', '/(home)')).toBe(true);
      expect(isRouteActive('track', '/(track)')).toBe(true);
      expect(isRouteActive('/profile', '(profile)')).toBe(true);
    });

    it('should not match different routes', () => {
      expect(isRouteActive('/(home)', '/(track)')).toBe(false);
      expect(isRouteActive('/(profile)', '/(scan)')).toBe(false);
      expect(isRouteActive('/(log)', '/(home)')).toBe(false);
    });

    it('should handle routes with leading slashes correctly', () => {
      expect(isRouteActive('/track', '/track')).toBe(true);
      expect(isRouteActive('track', '/track')).toBe(true);
      expect(isRouteActive('/track', 'track')).toBe(true);
    });
  });

  describe('getActiveIndex function', () => {
    it('should return correct index for log routes', () => {
      expect(getActiveIndex('/(log)')).toBe(0);
      expect(getActiveIndex('/log')).toBe(0);
      expect(getActiveIndex('log')).toBe(0);
    });

    it('should return correct index for track routes', () => {
      expect(getActiveIndex('/(track)')).toBe(1);
      expect(getActiveIndex('/track')).toBe(1);
      expect(getActiveIndex('track')).toBe(1);
    });

    it('should return correct index for home routes', () => {
      expect(getActiveIndex('/(home)')).toBe(2);
      expect(getActiveIndex('/')).toBe(2);
      expect(getActiveIndex('home')).toBe(2);
    });

    it('should return correct index for scan routes', () => {
      expect(getActiveIndex('/(scan)')).toBe(3);
      expect(getActiveIndex('/scan')).toBe(3);
      expect(getActiveIndex('scan')).toBe(3);
    });

    it('should return correct index for profile routes', () => {
      expect(getActiveIndex('/(profile)')).toBe(4);
      expect(getActiveIndex('/profile')).toBe(4);
      expect(getActiveIndex('profile')).toBe(4);
    });

    it('should default to home index (2) for unknown routes', () => {
      expect(getActiveIndex('/unknown')).toBe(2);
      expect(getActiveIndex('random')).toBe(2);
      expect(getActiveIndex('/(unknown)')).toBe(2);
    });
  });

  describe('Integration scenarios', () => {
    it('should handle complete navigation flow from home to track', () => {
      // Starting at home
      const homeSegments = ['(home)', 'index'];
      const homeRoute = getCurrentRoute(homeSegments);
      expect(homeRoute).toBe('/(home)');
      expect(getActiveIndex(homeRoute)).toBe(2);

      // Navigating to track
      const trackSegments = ['(track)', 'index'];
      const trackRoute = getCurrentRoute(trackSegments);
      expect(trackRoute).toBe('/(track)');
      expect(getActiveIndex(trackRoute)).toBe(1);

      // Verify route activation
      expect(isRouteActive('/(track)', trackRoute)).toBe(true);
      expect(isRouteActive('/(home)', trackRoute)).toBe(false);
    });

    it('should handle complete navigation flow through all tabs', () => {
      const testCases = [
        { segments: ['(log)', 'index'], expectedRoute: '/(log)', expectedIndex: 0 },
        { segments: ['(track)', 'track'], expectedRoute: '/(track)', expectedIndex: 1 },
        { segments: ['(home)', 'index'], expectedRoute: '/(home)', expectedIndex: 2 },
        { segments: ['(scan)', 'scan'], expectedRoute: '/(scan)', expectedIndex: 3 },
        { segments: ['(profile)', 'profile'], expectedRoute: '/(profile)', expectedIndex: 4 },
      ];

      testCases.forEach(({ segments, expectedRoute, expectedIndex }) => {
        const route = getCurrentRoute(segments);
        const index = getActiveIndex(route);
        
        expect(route).toBe(expectedRoute);
        expect(index).toBe(expectedIndex);
        expect(isRouteActive(expectedRoute, route)).toBe(true);
      });
    });

    it('should handle edge cases with malformed segments', () => {
      // Empty and undefined cases
      expect(getCurrentRoute([])).toBe('/(home)');
      expect(getCurrentRoute(undefined as any)).toBe('/(home)');
      
      // Mixed case scenarios
      expect(getCurrentRoute(['Track'])).toBe('/(track)');
      expect(getCurrentRoute(['PROFILE'])).toBe('/(home)'); // case sensitive, should fallback
    });
  });
});

describe('Navigation Component Integration', () => {
  it('should work with expo-router useSegments hook', () => {
    // Mock useSegments returning track route
    const mockSegments = ['(track)', 'index'];
    mockUseSegments.mockReturnValue(mockSegments);
    
    const segments = mockUseSegments() as string[];
    const currentRoute = getCurrentRoute(segments);
    const activeIndex = getActiveIndex(currentRoute);
    
    expect(currentRoute).toBe('/(track)');
    expect(activeIndex).toBe(1);
    expect(isRouteActive('/(track)', currentRoute)).toBe(true);
  });

  it('should handle pathname fallback scenarios', () => {
    // Test when segments might be unreliable
    const mockEmptySegments: string[] = [];
    mockUseSegments.mockReturnValue(mockEmptySegments);
    mockUsePathname.mockReturnValue('/profile');
    
    const segments = mockUseSegments() as string[];
    const pathname = mockUsePathname() as string;
    
    // Even with empty segments, our logic should fallback gracefully
    const currentRoute = getCurrentRoute(segments);
    expect(currentRoute).toBe('/(home)'); // Default fallback
    
    // But we could enhance to use pathname as secondary check
    const enhancedRoute = segments.length > 0 ? getCurrentRoute(segments) : pathname;
    expect(enhancedRoute).toBe('/profile');
  });
});
