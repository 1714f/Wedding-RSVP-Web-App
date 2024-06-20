import * as assert from 'assert';
import * as httpMocks from 'node-mocks-http';
import { save, load, resetForTesting, isRecord, updateGuestNum, updateGuestNumUp, updateFamNum, findGuestIndex, guest } from './routes';


describe('routes', function() {
  it('save', function() {
    // Branch 1: Missing or invalid 'name' parameter
    const req0 = httpMocks.createRequest({
      method: 'POST',
      url: '/api/save',
      body: { content: "Some content" }
    });
    const res0 = httpMocks.createResponse();
    save(req0, res0);
    assert.deepStrictEqual(res0.statusCode, 400);
    assert.deepStrictEqual(res0._getData(), "Invalid or missing 'name' parameter");

    const req1 = httpMocks.createRequest({
      method: 'POST',
      url: '/api/save',
      body: { name: 123 }
    });
    const res1 = httpMocks.createResponse();
    save(req1, res1);
    assert.deepStrictEqual(res1.statusCode, 400);
    assert.deepStrictEqual(res1._getData(), "Invalid or missing 'name' parameter");

    // Branch 2: Invalid or missing 'guestOf' parameter
    const req3 = httpMocks.createRequest({ method: 'POST', url: '/api/save', body: { name: "John", guestOf: "friend" } });
    const res3 = httpMocks.createResponse();
    save(req3, res3);
    assert.deepStrictEqual(res3._getStatusCode(), 400);
    assert.deepStrictEqual(res3._getData(), 'Invalid or missing argument "guestOf"');

    const req4 = httpMocks.createRequest({ method: 'POST', url: '/api/save', body: { name: "John", guestOf: 123 } });
    const res4 = httpMocks.createResponse();
    save(req4, res4);
    assert.deepStrictEqual(res4._getStatusCode(), 400);
    assert.deepStrictEqual(res4._getData(), 'Invalid or missing argument "guestOf"');

    // Branch 3: Invalid or missing 'isFamily' parameter
    const req5 = httpMocks.createRequest({ method: 'POST', url: '/api/save', body: { name: "John", isFamily: "true" } });
    const res5 = httpMocks.createResponse();
    save(req5, res5);
    assert.deepStrictEqual(res5._getStatusCode(), 400);
    assert.deepStrictEqual(res5._getData(), "Invalid or missing 'isFamily' parameter");

    const req6 = httpMocks.createRequest({ method: 'POST', url: '/api/save', body: { name: "John", isFamily: undefined } });
    const res6 = httpMocks.createResponse();
    save(req6, res6);
    assert.deepStrictEqual(res6._getStatusCode(), 400);
    assert.deepStrictEqual(res6._getData(), "Invalid or missing 'isFamily' parameter");

    // Branch 4: Invalid 'dietary' parameter
    const req7 = httpMocks.createRequest({ method: 'POST', url: '/api/save', body: { name: "John", isFamily: true, dietary: 123 } });
    const res7 = httpMocks.createResponse();
    save(req7, res7);
    assert.deepStrictEqual(res7._getStatusCode(), 400);
    assert.deepStrictEqual(res7._getData(), 'Invalid "dietary" parameter');

    const req7a = httpMocks.createRequest({ method: 'POST', url: '/api/save', body: { name: "John", isFamily: true } });
    const res7a = httpMocks.createResponse();
    save(req7a, res7a);
    assert.deepStrictEqual(res7a._getStatusCode(), 400);
    assert.deepStrictEqual(res7a._getData(), 'Invalid "dietary" parameter');

    // Branch 5: Invalid 'additionalGuest' parameter
    const req8 = httpMocks.createRequest({ method: 'POST', url: '/api/save', body: { name: "John", isFamily: true, dietary: "none", additionalGuest: "guest" } });
    const res8 = httpMocks.createResponse();
    save(req8, res8);
    assert.deepStrictEqual(res8._getStatusCode(), 400);
    assert.deepStrictEqual(res8._getData(), 'Invalid or missing "additionalGuest" parameter');

    const req9 = httpMocks.createRequest({
      method: 'POST', url: '/api/save', body: {
        name: "John", isFamily: true, dietary: "none", additionalGuest: { kind: "huh?", name: "Guest" }
      }
    });
    const res9 = httpMocks.createResponse();
    save(req9, res9);
    assert.deepStrictEqual(res9._getStatusCode(), 400);
    assert.deepStrictEqual(res9._getData(), 'Invalid or missing "additionalGuest" parameter');

    // Branch 6: Valid request with all required parameters
    const req10 = httpMocks.createRequest({
      method: 'POST', url: '/api/save', body: {
        name: "John", guestOf: "husb", isFamily: true, dietary: "Vegetarian", additionalGuest: { kind: "0", name: "Guest", dietary: "Vegan" }
      }
    });
    const res10 = httpMocks.createResponse();
    save(req10, res10);
    assert.deepStrictEqual(res10._getStatusCode(), 200);
    assert.deepStrictEqual(res10._getData(), {
      husb: { name: "James", numGuest: 1, numGuestUp: 1, numFam: 1 },
      wife: { name: "Molly", numGuest: 0, numGuestUp: 0, numFam: 0 },
      guestArray: [{
        name: "John",
        guestOf: "husb",
        isFamily: true,
        dietary: "Vegetarian",
        additionalGuest: { kind: "0", name: "Guest", dietary: "Vegan" }
      }]
    });

    const req11 = httpMocks.createRequest({
      method: 'POST', url: '/api/save', body: {
        name: "Wick", guestOf: "husb", isFamily: false, dietary: "Vegetarian", additionalGuest: { kind: "1", name: "Guest", dietary: "Vegan" }
      }
    });
    const res11 = httpMocks.createResponse();
    save(req11, res11);
    assert.deepStrictEqual(res11._getStatusCode(), 200);
    assert.deepStrictEqual(res11._getData(), {
      husb: { name: "James", numGuest: 3, numGuestUp: 3, numFam: 1 },
      wife: { name: "Molly", numGuest: 0, numGuestUp: 0, numFam: 0 },
      guestArray: [{
        name: "John",
        guestOf: "husb",
        isFamily: true,
        dietary: "Vegetarian",
        additionalGuest: { kind: "0", name: "Guest", dietary: "Vegan" }
      }, {
        name: "Wick",
        guestOf: "husb",
        isFamily: false,
        dietary: "Vegetarian",
        additionalGuest: { kind: "1", name: "Guest", dietary: "Vegan" }
      }]
    });
    resetForTesting();
  });

  it('load', function() {
    // Tests for stright line code
    // Test an empty load
    const req1 = httpMocks.createRequest({ method: 'GET', url: '/api/load' });
    const res1 = httpMocks.createResponse();
    load(req1, res1);
    assert.deepStrictEqual(res1._getStatusCode(), 200);
    assert.deepStrictEqual(res1._getData(), { 
      husb: {name: "James", numGuest: 0, numGuestUp: 0, numFam: 0},
      wife: {name: "Molly", numGuest: 0, numGuestUp: 0, numFam: 0}, 
      guestArray: [] });

    // Save some data to load later
    const req10 = httpMocks.createRequest({
      method: 'POST', url: '/api/save', body: {
        name: "John", guestOf: "husb", isFamily: true, dietary: "Vegetarian", additionalGuest: { kind: "0", name: "Guest", dietary: "Vegan" }
      }
    });
    const res10 = httpMocks.createResponse();
    save(req10, res10);  
    const req11 = httpMocks.createRequest({
      method: 'POST', url: '/api/save', body: {
        name: "Wick", guestOf: "husb", isFamily: false, dietary: "Vegetarian", additionalGuest: { kind: "1", name: "Guest", dietary: "Vegan" }
      }
    });
    const res11 = httpMocks.createResponse();
    save(req11, res11);

    const req2 = httpMocks.createRequest({ method: 'GET', url: '/api/load' });
    const res2 = httpMocks.createResponse();
    load(req2, res2);
    assert.deepStrictEqual(res1._getStatusCode(), 200);
    assert.deepStrictEqual(res2._getData(), {
      husb: { name: "James", numGuest: 3, numGuestUp: 3, numFam: 1 },
      wife: { name: "Molly", numGuest: 0, numGuestUp: 0, numFam: 0 },
      guestArray: [{
        name: "John",
        guestOf: "husb",
        isFamily: true,
        dietary: "Vegetarian",
        additionalGuest: { kind: "0", name: "Guest", dietary: "Vegan" }
      }, {
        name: "Wick",
        guestOf: "husb",
        isFamily: false,
        dietary: "Vegetarian",
        additionalGuest: { kind: "1", name: "Guest", dietary: "Vegan" }
      }]
    });
    resetForTesting();
  });

  it('isRecord', function() {
    // Tests for stright line code
    assert.deepStrictEqual(isRecord({}), true);
    assert.deepStrictEqual(isRecord({ key: "value" }), true);
    assert.deepStrictEqual(isRecord({ a: 1, b: "test" }), true);
    assert.deepStrictEqual(isRecord("string"), false);
    assert.deepStrictEqual(isRecord(123), false);
  });

  it('updateGuestNum', function() {
    // Recursion, use 0-1-many heuristics to test.
    // Base Case
    const guestArray: guest[] = [{ name: "John", guestOf: "husb", isFamily: true, dietary: "none", additionalGuest: { kind: "0", name: "Guest", dietary: "Vegan" } }];
    const result = updateGuestNum(guestArray, "wife");
    assert.deepStrictEqual(result, 0);

    const guestArray1: guest[] = [{ name: "Jane", guestOf: "wife", isFamily: false, dietary: "none", additionalGuest: { kind: "0", name: "Guest", dietary: "Vegan" } }];
    const result1 = updateGuestNum(guestArray1, "wife");
    assert.deepStrictEqual(result1, 1);

    // 1 recursive call
    const guestArray2: guest[] = [
      { name: "Alice", guestOf: "husb", isFamily: true, dietary: "none", additionalGuest: { kind: "1", name: "Guest", dietary: "Vegan" } },
      { name: "Bob", guestOf: "wife", isFamily: true, dietary: "none", additionalGuest: { kind: "0", name: "Guest", dietary: "Vegan" } }
    ];
    const result2 = updateGuestNum(guestArray2, "husb");
    assert.deepStrictEqual(result2, 2);

    const guestArray3: guest[] = [
      { name: "Alice", guestOf: "wife", isFamily: true, dietary: "none", additionalGuest: { kind: "1", name: "Guest", dietary: "Vegan" } },
      { name: "Bob", guestOf: "husb", isFamily: true, dietary: "none", additionalGuest: { kind: "unknown", name: "Guest", dietary: "Vegan" } }
    ];
    const result3 = updateGuestNum(guestArray3, "husb");
    assert.deepStrictEqual(result3, 1);

    // many recursive calls
    const guestArray4: guest[] = [
      { name: "Alice", guestOf: "wife", isFamily: true, dietary: "none", additionalGuest: { kind: "0", name: "Guest", dietary: "Vegan" } },
      { name: "Bob", guestOf: "wife", isFamily: true, dietary: "none", additionalGuest: { kind: "0", name: "Guest", dietary: "Vegan" } },
      { name: "Charlie", guestOf: "husb", isFamily: true, dietary: "none", additionalGuest: { kind: "0", name: "Guest", dietary: "Vegan" } }
    ];
    const result4 = updateGuestNum(guestArray4, "wife");
    assert.deepStrictEqual(result4, 2);

    const guestArray5: guest[] = [
      { name: "Alice", guestOf: "wife", isFamily: true, dietary: "none", additionalGuest: { kind: "1", name: "Guest", dietary: "Vegan" } },
      { name: "Bob", guestOf: "wife", isFamily: true, dietary: "none", additionalGuest: { kind: "1", name: "Guest", dietary: "Vegan" } },
      { name: "Charlie", guestOf: "husb", isFamily: true, dietary: "none", additionalGuest: { kind: "0", name: "Guest", dietary: "Vegan" } }
    ];
    const result5 = updateGuestNum(guestArray5, "wife");
    assert.deepStrictEqual(result5, 4);

    // Error case branch
    assert.throws(() => updateGuestNum([], "wife"), Error);
    assert.throws(() => updateGuestNum([], "husb"), Error);
  });

  it('updateGuestNumUp', function() {
    // Recursion, use 0-1-many heuristics to test.
    // Base Case
    const guestArray: guest[] = [{ name: "John", guestOf: "husb", isFamily: true, dietary: "none", additionalGuest: { kind: "0", name: "Guest", dietary: "Vegan" } }];
    const result = updateGuestNumUp(guestArray, "wife");
    assert.deepStrictEqual(result, 0);

    const guestArray1: guest[] = [{ name: "Jane", guestOf: "wife", isFamily: false, dietary: "none", additionalGuest: { kind: "0", name: "Guest", dietary: "Vegan" } }];
    const result1 = updateGuestNumUp(guestArray1, "wife");
    assert.deepStrictEqual(result1, 1);

    // 1 recursive call
    const guestArray2: guest[] = [
      { name: "Alice", guestOf: "husb", isFamily: true, dietary: "none", additionalGuest: { kind: "unknown", name: "Guest", dietary: "Vegan" } },
      { name: "Bob", guestOf: "wife", isFamily: true, dietary: "none", additionalGuest: { kind: "0", name: "Guest", dietary: "Vegan" } }
    ];
    const result2 = updateGuestNumUp(guestArray2, "husb");
    assert.deepStrictEqual(result2, 2);

    const guestArray3: guest[] = [
      { name: "Alice", guestOf: "wife", isFamily: true, dietary: "none", additionalGuest: { kind: "1", name: "Guest", dietary: "Vegan" } },
      { name: "Bob", guestOf: "husb", isFamily: true, dietary: "none", additionalGuest: { kind: "unknown", name: "Guest", dietary: "Vegan" } }
    ];
    const result3 = updateGuestNumUp(guestArray3, "husb");
    assert.deepStrictEqual(result3, 2);

    // many recursive calls
    const guestArray4: guest[] = [
      { name: "Alice", guestOf: "wife", isFamily: true, dietary: "none", additionalGuest: { kind: "0", name: "Guest", dietary: "Vegan" } },
      { name: "Bob", guestOf: "wife", isFamily: true, dietary: "none", additionalGuest: { kind: "unknown", name: "Guest", dietary: "Vegan" } },
      { name: "Charlie", guestOf: "husb", isFamily: true, dietary: "none", additionalGuest: { kind: "0", name: "Guest", dietary: "Vegan" } }
    ];
    const result4 = updateGuestNumUp(guestArray4, "wife");
    assert.deepStrictEqual(result4, 3);

    const guestArray5: guest[] = [
      { name: "Alice", guestOf: "wife", isFamily: true, dietary: "none", additionalGuest: { kind: "1", name: "Guest", dietary: "Vegan" } },
      { name: "Bob", guestOf: "wife", isFamily: true, dietary: "none", additionalGuest: { kind: "1", name: "Guest", dietary: "Vegan" } },
      { name: "Charlie", guestOf: "husb", isFamily: true, dietary: "none", additionalGuest: { kind: "0", name: "Guest", dietary: "Vegan" } }
    ];
    const result5 = updateGuestNumUp(guestArray5, "wife");
    assert.deepStrictEqual(result5, 4);

    // Error case branch
    assert.throws(() => updateGuestNumUp([], "wife"), Error);
    assert.throws(() => updateGuestNumUp([], "husb"), Error);
  });

  it('updateFamNum', function() {
    // Recursion, use 0-1-many heuristics to test.
    // Base Case
    const guestArray: guest[] = [{ name: "John", guestOf: "husb", isFamily: true, dietary: "none", additionalGuest: { kind: "0", name: "Guest", dietary: "Vegan" } }];
    const result = updateFamNum(guestArray, "wife");
    assert.deepStrictEqual(result, 0);

    const guestArray1: guest[] = [{ name: "Jane", guestOf: "wife", isFamily: true, dietary: "none", additionalGuest: { kind: "0", name: "Guest", dietary: "Vegan" } }];
    const result1 = updateFamNum(guestArray1, "wife");
    assert.deepStrictEqual(result1, 1);

    // 1 recursive call
    const guestArray2: guest[] = [
      { name: "Alice", guestOf: "husb", isFamily: true, dietary: "none", additionalGuest: { kind: "unknown", name: "Guest", dietary: "Vegan" } },
      { name: "Bob", guestOf: "wife", isFamily: true, dietary: "none", additionalGuest: { kind: "0", name: "Guest", dietary: "Vegan" } }
    ];
    const result2 = updateFamNum(guestArray2, "husb");
    assert.deepStrictEqual(result2, 1);

    const guestArray3: guest[] = [
      { name: "Alice", guestOf: "wife", isFamily: true, dietary: "none", additionalGuest: { kind: "1", name: "Guest", dietary: "Vegan" } },
      { name: "Bob", guestOf: "husb", isFamily: false, dietary: "none", additionalGuest: { kind: "unknown", name: "Guest", dietary: "Vegan" } }
    ];
    const result3 = updateFamNum(guestArray3, "husb");
    assert.deepStrictEqual(result3, 0);

    // many recursive calls
    const guestArray4: guest[] = [
      { name: "Alice", guestOf: "wife", isFamily: true, dietary: "none", additionalGuest: { kind: "0", name: "Guest", dietary: "Vegan" } },
      { name: "Bob", guestOf: "wife", isFamily: true, dietary: "none", additionalGuest: { kind: "unknown", name: "Guest", dietary: "Vegan" } },
      { name: "Charlie", guestOf: "husb", isFamily: true, dietary: "none", additionalGuest: { kind: "0", name: "Guest", dietary: "Vegan" } }
    ];
    const result4 = updateFamNum(guestArray4, "wife");
    assert.deepStrictEqual(result4, 2);

    const guestArray5: guest[] = [
      { name: "Alice", guestOf: "wife", isFamily: true, dietary: "none", additionalGuest: { kind: "1", name: "Guest", dietary: "Vegan" } },
      { name: "Bob", guestOf: "wife", isFamily: true, dietary: "none", additionalGuest: { kind: "1", name: "Guest", dietary: "Vegan" } },
      { name: "Charlie", guestOf: "husb", isFamily: true, dietary: "none", additionalGuest: { kind: "0", name: "Guest", dietary: "Vegan" } }
    ];
    const result5 = updateFamNum(guestArray5, "husb");
    assert.deepStrictEqual(result5, 1);

    // Error case branch
    assert.throws(() => updateFamNum([], "wife"), Error);
    assert.throws(() => updateFamNum([], "husb"), Error);
  });

  it('findGuestIndex', function() {
    // Recursion, use 0-1-many heuristics to test.
    // Base Case
    const currGuest: guest = { name: "John", guestOf: "husb", isFamily: true, dietary: "none", additionalGuest: { kind: "0", name: "Guest", dietary: "Vegan" } };
    const guestArray: guest[] = [currGuest];
    const result = findGuestIndex(currGuest, guestArray);
    assert.deepStrictEqual(result, 0);

    const guestArray1: guest[] = [{ name: "Jane", guestOf: "wife", isFamily: false, dietary: "none", additionalGuest: { kind: "0", name: "Guest", dietary: "Vegan" } }];
    const result1 = findGuestIndex(currGuest, guestArray1);
    assert.deepStrictEqual(result1, 2);

    // 1 recursive call
    const guestArray2: guest[] = [{ name: "Jane", guestOf: "wife", isFamily: false, dietary: "none", additionalGuest: { kind: "0", name: "Guest", dietary: "Vegan" }}, currGuest];
    const result2 = findGuestIndex(currGuest, guestArray2);
    assert.deepStrictEqual(result2, 1);

    const guestArray3: guest[] = [{ name: "Jane", guestOf: "wife", isFamily: false, dietary: "none", additionalGuest: { kind: "0", name: "Guest", dietary: "Vegan" }}, currGuest, { name: "Weak", guestOf: "husb", isFamily: true, dietary: "none", additionalGuest: { kind: "0", name: "Guest", dietary: "Vegan" }}];
    const result3 = findGuestIndex(currGuest, guestArray3);
    assert.deepStrictEqual(result3, 1);

    // many recursive calls
    const guestArray4: guest[] = [{ name: "Jane", guestOf: "wife", isFamily: false, dietary: "none", additionalGuest: { kind: "0", name: "Guest", dietary: "Vegan" }}, { name: "Weak", guestOf: "husb", isFamily: true, dietary: "none", additionalGuest: { kind: "0", name: "Guest", dietary: "Vegan" }}, currGuest];
    const result4 = findGuestIndex(currGuest, guestArray4);
    assert.deepStrictEqual(result4, 2);

    const guestArray5: guest[] = [{ name: "Jane", guestOf: "wife", isFamily: false, dietary: "none", additionalGuest: { kind: "0", name: "Guest", dietary: "Vegan" }}, { name: "Weak", guestOf: "husb", isFamily: true, dietary: "none", additionalGuest: { kind: "0", name: "Guest", dietary: "Vegan" }}, { name: "Jame", guestOf: "husb", isFamily: false, dietary: "none", additionalGuest: { kind: "0", name: "Guest", dietary: "Vegan" }}];
    const result5 = findGuestIndex(currGuest, guestArray5);
    assert.deepStrictEqual(result5, 4);
  });
});
