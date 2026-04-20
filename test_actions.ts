import { getCountries, getProvinces } from './src/core/actions/location';

async function test() {
  console.log("Testing getProvinces...");
  const p = await getProvinces();
  console.log("getProvinces success:", p.success);
  if (p.success) console.log("getProvinces data count:", p.data.length);

  console.log("\nTesting getCountries...");
  const c = await getCountries();
  console.log("getCountries success:", c.success);
  if (c.success) console.log("getCountries data count:", c.data.length);
}

test();
