const detectIntent = (str) => {
  const returnObj = {};
  let genList = [];
  if (/\bm(e|a)n\b|\bmales?\b|\bboy\b|\bboys\b/.test(str)) {
    genList.push('male');
  }
  if (/\bwom(a|e)n\b|\bgirls?\b/.test(str)) {
    genList.push('female');
  }
  if (/\bnigeria\b/i.test(str)) {
    returnObj.country = 'nigeria';
  }
  const result = str.match(/(?:above|over|older than) (\d+)/);
  if (result && result.length > 0) {
    const age = result[1];
    returnObj.min_age = Number(age);
  }
  const result_max = str.match(/(?:below|over|older than|younger than) (\d+)/);
  if (result_max && result_max.length > 0) {
    const age = result_max[1];
    returnObj.max_age = Number(age);
  }
  if (genList.length > 0) {
    returnObj.gender = genList;
  }
  if (Object.keys(returnObj).length > 0) {
    return returnObj;
  } else {
    return null;
  }
};
// detectIntent('show me men in nigeria');
// // { gender: 'male', country: 'nigeria' }

// detectIntent('women above 30');
// // { gender: 'female' }

// detectIntent('hello world');
// // null  ← nothing recognised

const val = detectIntent('show me man in nigeria');
console.log(val);
const val2 = detectIntent('show me male in nigeria');
console.log(val2);
const val3 = detectIntent('hello world');
console.log(val3);
const val4 = detectIntent('show me women and man in nigeria');
console.log(val4);
const val5 = detectIntent('women above 30 in nigeria and men below 50');
console.log(val5);
console.log(detectIntent('men over 25 in nigeria'));
console.log(detectIntent('women older than 40'));
console.log(detectIntent('men younger than 50'));
