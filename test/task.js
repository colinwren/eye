process.stdout.write('task');
if (process.argv.indexOf('--option') !== -1) {
  process.stdout.write('option');
}
