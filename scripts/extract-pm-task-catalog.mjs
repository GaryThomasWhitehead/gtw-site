import ExcelJS from 'exceljs';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const source = process.argv[2];
const destination = process.argv[3] || path.join(process.cwd(), 'data', 'pm-task-catalog.json');
if (!source) throw new Error('Usage: node scripts/extract-pm-task-catalog.mjs <workbook.xlsx> [output.json]');

const textOf = value => {
  if (value == null) return '';
  if (typeof value === 'string' || typeof value === 'number') return String(value).trim();
  if (Array.isArray(value.richText)) return value.richText.map(part => part.text || '').join('').trim();
  if (value.result != null) return textOf(value.result);
  if (value.text != null) return String(value.text).trim();
  return '';
};

const workbook = new ExcelJS.Workbook();
await workbook.xlsx.readFile(source);
const start = workbook.worksheets.findIndex(sheet => sheet.name === 'SLIDER BED');
const end = workbook.worksheets.findIndex(sheet => sheet.name === 'GDU BYPASS');
if (start < 0 || end < start) throw new Error('Could not find the SLIDER BED through GDU BYPASS worksheet range.');

const specialTasks = {
  'E-STOP': [
    'Reference the site electrical drawings and identify all E-Stop devices on the control prints (SE, SM, pullcords, and related devices).',
    'Use two people with phones or radios: one at the GDU and one walking the E-Stop switches.',
    'For each System E-Stop (SE), verify the field label matches the drawing and inspect the device and conduit for damage.',
    'For each System E-Stop (SE), activate the device and verify the GDU alarm name and active alarm banner match the drawing.',
    'For each System E-Stop (SE), verify smooth and complete activation and confirm the bulb is lit.',
    'For each System E-Stop (SE), deactivate the device and verify the alarm clears, the bulb turns off, and the MCP system reset is active.',
    'For each System E-Stop (SM), verify the field label matches the drawing and inspect the device and conduit for damage.',
    'For each System E-Stop (SM), activate the device and verify the GDU alarm name and active alarm banner match the drawing.',
    'For each System E-Stop (SM), verify smooth and complete activation and confirm the bulb is lit.',
    'For each System E-Stop (SM), deactivate the device and verify the alarm clears, the bulb turns off, and the MCP system reset is active.',
    'For each Emergency Pullcord (EPC), verify the label matches the drawing and inspect the device, conduit, and cable tension.',
    'For each Emergency Pullcord (EPC), activate it and verify the GDU alarm name and active alarm banner match the drawing.',
    'For each Emergency Pullcord (EPC), verify smooth and complete activation and confirm the bulb is lit.',
    'For each Emergency Pullcord (EPC), deactivate it and verify the alarm clears, the bulb turns off, and the MCP system reset is active.'
  ],
  'MCR': [
    'Reference the site electrical drawings and identify the relays in the E-Stop MCR circuit.',
    'Use the drawing BOM to identify manufacturer and part information and verify the installed relay matches the BOM.',
    'Redline the BOM when an installed relay does not match.',
    'Check local relay inventory and update Correctives & Parts and inventory as necessary.',
    'Review the E-Stop relay series circuit drawings and verify the relay sequence matches the drawings.',
    'Cross-reference drawing wire numbers with installed relays and verify they match.',
    'Redline all relay and wire-number inconsistencies.',
    'Check the MCP for E-Stop relays not shown on the drawings and list them as correctives.',
    'Check the GDU for E-Stop relays not shown on the drawings and list them as correctives.',
    'For each relay, verify its physical location and label match the MCP drawings.',
    'For each relay, verify the coil wire labels match the drawings.',
    'For each relay, activate the associated E-Stop and confirm the GDU reports the E-Stop relay alarm.',
    'Record all relay discrepancies as correctives.'
  ],
  'E-STOP INVENTORY': [
    'Reference the site electrical drawings and identify all E-Stop devices on the prints (SE, SM, pullcords, and related devices).',
    'Use the BOM to identify the manufacturer and part number for each device.',
    'Account for every component in multi-component switch assemblies.',
    'Randomly select one switch of each type, apply LOTO, and verify it is de-energized.',
    'Open each selected switch enclosure and verify its components match the BOM.',
    'Add the correct parts to Correctives & Parts when a component does not match the BOM.',
    'Inventory local stock for the identified E-Stop parts.',
    'Update the onsite inventory worksheets.'
  ],
  'GDU BYPASS': [
    'Reference the site electrical drawings and identify the site GDU bypass switches.',
    'Identify the bypass control type: exterior MCP door, interior MCP, or removable pendant.',
    'Verify all system controls are in the run position.',
    'Record failed tests in Correctives & Parts and contact FMC.',
    'Outbound: On the GDU, select Outbound and the chute positions, start the system, verify operation, and stop it.',
    'Outbound: At the bypass controls, select Outbound, press Reset, press Start, verify the conveyors start, and press Stop.',
    'Outbound: Disconnect the GDU communications cable; at the bypass controls select Outbound, Reset, and Start; verify conveyors start; then Stop.',
    'Outbound: Reconnect the GDU communications cable and return bypass controls to Auto/non-bypass.',
    'Outbound: On the GDU, select Outbound, start the system, verify operation, and stop it.',
    'Inbound: On the GDU, select Inbound and the chute positions, start the system, verify operation, and stop it.',
    'Inbound: At the bypass controls, select Inbound, press Reset, press Start, verify the conveyors start, and press Stop.',
    'Inbound: Disconnect the GDU communications cable; at the bypass controls select Inbound, Reset, and Start; verify conveyors start; then Stop.',
    'Inbound: Reconnect the GDU communications cable and return bypass controls to Auto/non-bypass.',
    'Inbound: On the GDU, select Inbound, start the system, verify operation, and stop it.'
  ]
};

const catalog = [];
for (const sheet of workbook.worksheets.slice(start, end + 1)) {
  if (sheet.name === 'Sheet5') continue;
  let tasks;
  if (specialTasks[sheet.name]) {
    tasks = specialTasks[sheet.name].map((description, index) => ({ task: String(index + 1), description }));
  } else {
    tasks = [];
    for (let row = 2; row <= sheet.rowCount; row++) {
      const task = textOf(sheet.getCell(row, 1).value);
      const description = textOf(sheet.getCell(row, 2).value);
      if (description) tasks.push({ task: task || String(row - 1), description });
    }
  }
  if (tasks.length) catalog.push({ name: sheet.name, tasks });
}

await mkdir(path.dirname(destination), { recursive: true });
await writeFile(destination, JSON.stringify(catalog, null, 2) + '\n', 'utf8');
console.log(`Wrote ${catalog.length} PM task groups and ${catalog.reduce((sum, group) => sum + group.tasks.length, 0)} checklist items to ${destination}`);
