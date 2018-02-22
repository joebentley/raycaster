
export function copy2DArray(array) {
  return array.slice().map( function(row){ return row.slice(); });
}
