import { describe, it, expect } from 'vitest';

// Extract the showPanel logic into a testable function
function computeShowPanel(options: { 
  isPreview: boolean; 
  hasVC: boolean; 
  panelFlag: boolean; 
}) {
  const { isPreview, hasVC, panelFlag } = options;
  
  return (
    panelFlag ||                         // explicit dev flag
    (isPreview && hasVC) ||              // preview auto-open
    (!isPreview && hasVC)                // launch page
  );
}

describe('ShowPanel Logic', () => {
  describe('Preview mode auto-open', () => {
    it('should show panel in preview mode when form has VC fields', () => {
      expect(computeShowPanel({
        isPreview: true, 
        hasVC: true, 
        panelFlag: false
      })).toBe(true);
    });

    it('should not show panel in preview mode when form has no VC fields', () => {
      expect(computeShowPanel({
        isPreview: true, 
        hasVC: false, 
        panelFlag: false
      })).toBe(false);
    });
  });

  describe('Launch mode behavior', () => {
    it('should show panel in launch mode when form has VC fields', () => {
      expect(computeShowPanel({
        isPreview: false, 
        hasVC: true, 
        panelFlag: false
      })).toBe(true);
    });

    it('should not show panel in launch mode when form has no VC fields', () => {
      expect(computeShowPanel({
        isPreview: false, 
        hasVC: false, 
        panelFlag: false
      })).toBe(false);
    });
  });

  describe('Panel flag override', () => {
    it('should always show panel when panelFlag=true, regardless of other conditions', () => {
      // Preview mode, no VC fields, but panel flag set
      expect(computeShowPanel({
        isPreview: true, 
        hasVC: false, 
        panelFlag: true
      })).toBe(true);

      // Launch mode, no VC fields, but panel flag set
      expect(computeShowPanel({
        isPreview: false, 
        hasVC: false, 
        panelFlag: true
      })).toBe(true);
    });
  });

  describe('All combinations', () => {
    const testCases = [
      // isPreview, hasVC, panelFlag, expected
      [true,  true,  false, true],   // preview + VC = auto-open
      [true,  false, false, false],  // preview + no VC = hidden
      [false, true,  false, true],   // launch + VC = show
      [false, false, false, false],  // launch + no VC = hidden
      [true,  true,  true,  true],   // panel flag always wins
      [true,  false, true,  true],   // panel flag always wins
      [false, true,  true,  true],   // panel flag always wins
      [false, false, true,  true],   // panel flag always wins
    ];

    testCases.forEach(([isPreview, hasVC, panelFlag, expected]) => {
      it(`should return ${expected} for isPreview=${isPreview}, hasVC=${hasVC}, panelFlag=${panelFlag}`, () => {
        expect(computeShowPanel({
          isPreview: isPreview as boolean,
          hasVC: hasVC as boolean,
          panelFlag: panelFlag as boolean
        })).toBe(expected);
      });
    });
  });
});