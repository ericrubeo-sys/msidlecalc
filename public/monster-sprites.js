// Fixed, name-verified MapleStory.io GMS83 assets. No player-derived URL data.
// Art is Nexon's; this adapter records a small external prototype dependency.
const icon=id=>`https://maplestory.io/api/GMS/83/mob/${id}/icon`;
export const LOADING_MONSTERS=Object.freeze([
  Object.freeze({id:210100,name:'Slime',url:icon(210100),gait:'hop',faces:'left',width:58,height:48}),
  Object.freeze({id:1210102,name:'Orange Mushroom',url:icon(1210102),gait:'waddle',faces:'left',width:54,height:58}),
  Object.freeze({id:1210101,name:'Ribbon Pig',url:icon(1210101),gait:'trot',faces:'left',width:58,height:48}),
]);
