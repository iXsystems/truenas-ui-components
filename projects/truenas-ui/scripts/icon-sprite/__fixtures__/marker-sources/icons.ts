import { tnIconMarker } from '../lib/icon/icon-marker';
import { libIconMarker } from '../lib/icon/icon-marker';

// MDI icons
const saveIcon = tnIconMarker('content-save', 'mdi');
const deleteIcon = tnIconMarker('delete', 'mdi');

// Material icons
const checkIcon = tnIconMarker('check_circle', 'material');

// Custom icon
const logoIcon = tnIconMarker('my-logo', 'custom');

// No library
const rawIcon = tnIconMarker('some-icon');

// Library internal
const datasetIcon = libIconMarker('tn-dataset');

// Array of icons
const actions = [
  { name: 'Edit', icon: tnIconMarker('pencil', 'mdi') },
  { name: 'Remove', icon: tnIconMarker('trash-can', 'mdi') },
];
