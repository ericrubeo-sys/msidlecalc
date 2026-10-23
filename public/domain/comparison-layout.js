// Supported screenshot contract supplied by the user: left equipped, right candidate.
// Geometry establishes only which reviewed area is left, never numeric certainty.
export function assignComparisonLayout(panels) {
  const fail = reason => ({ status:'needsAreas', reason, assignment:null, panels:[] });
  if (!Array.isArray(panels) || panels.length !== 2) return fail('twoAreasRequired');
  if (panels.some(p => !p || typeof p.id !== 'string' || !p.id || !p.region || !['x','y','width','height'].every(k=>Number.isFinite(p.region[k])) || p.region.x<0 || p.region.y<0 || p.region.width<=0 || p.region.height<=0) || panels[0].id===panels[1].id) return fail('invalidAreas');
  const ordered = [...panels].sort((a,b)=>(a.region.x+a.region.width/2)-(b.region.x+b.region.width/2));
  const [a,b] = ordered.map(p=>p.region);
  const verticalOverlap = Math.min(a.y+a.height,b.y+b.height)-Math.max(a.y,b.y);
  const horizontalOverlap = Math.max(0,Math.min(a.x+a.width,b.x+b.width)-Math.max(a.x,b.x));
  if (verticalOverlap < .5*Math.min(a.height,b.height) || horizontalOverlap > .25*Math.min(a.width,b.width) || b.x+b.width/2-a.x-a.width/2 < .5*Math.min(a.width,b.width)) return fail('sideBySideAreasRequired');
  return { status:'assigned', assignment:{current:ordered[0].id,candidate:ordered[1].id}, panels:structuredClone(ordered), basis:'user-specified-left-equipped-right-candidate' };
}
