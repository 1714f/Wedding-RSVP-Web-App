import * as assert from 'assert';
import { isRecord } from './record';
import { parseGuest } from './Guest';
import { toValidKind } from './GuestDetail';

describe('routes', function() {
    it('isRecord', function() {
        // Tests for stright line code
        assert.deepStrictEqual(isRecord({}), true);
        assert.deepStrictEqual(isRecord({ key: "value" }), true);
        assert.deepStrictEqual(isRecord({ a: 1, b: "test" }), true);
        assert.deepStrictEqual(isRecord("string"), false);
        assert.deepStrictEqual(isRecord(123), false);
    });

    it('parseGuest', function() {
        // Branch 1: not a record
        const result = parseGuest(42);
        assert.deepStrictEqual(result, undefined);

        const result1 = parseGuest("string");
        assert.deepStrictEqual(result1, undefined);

        // Branch 2: Invalid or missing name
        const result2 = parseGuest({ name: 123, guestOf: "husb", isFamily: true, dietary: "none", additionalGuest: { kind: "0", name: "guest", dietary: "none" } });
        assert.deepStrictEqual(result2, undefined);

        const result3 = parseGuest({ guestOf: "husb", isFamily: true, dietary: "none", additionalGuest: { kind: "0", name: "guest", dietary: "none" } });
        assert.deepStrictEqual(result3, undefined);

        // Branch 3: Invalid or missing guestOf
        const result4 = parseGuest({ name: "John", guestOf: "hello", isFamily: true, dietary: "none", additionalGuest: { kind: "0", name: "guest", dietary: "none" } });
        assert.deepStrictEqual(result4, undefined);

        const result5 = parseGuest({ name: "John", isFamily: true, dietary: "none", additionalGuest: { kind: "0", name: "guest", dietary: "none" } });
        assert.deepStrictEqual(result5, undefined);

        // Branch 4: Invalid or missing isFamily
        const result6 = parseGuest({ name: "John", guestOf: "husb", isFamily: "hi", dietary: "none", additionalGuest: { kind: "0", name: "guest", dietary: "none" } });
        assert.deepStrictEqual(result6, undefined);

        const result7 = parseGuest({ name: "John", guestOf: "husb", dietary: "none", additionalGuest: { kind: "0", name: "guest", dietary: "none" } });
        assert.deepStrictEqual(result7, undefined);

        // Branch 5: Invalid or missing dietary
        const result8 = parseGuest({ name: "John", guestOf: "husb", isFamily: "yes", dietary: 1, additionalGuest: { kind: "0", name: "guest", dietary: "none" } });
        assert.deepStrictEqual(result8, undefined);

        const result9 = parseGuest({ name: "John", guestOf: "husb", isFamily: "yes", additionalGuest: { kind: "0", name: "guest", dietary: "none" } });
        assert.deepStrictEqual(result9, undefined);

        // Branch 6: Invalid or missing additionalGuest
        const result10 = parseGuest({ name: "John", guestOf: "husb", isFamily: true, dietary: "none", additionalGuest: "not a record" });
        assert.deepStrictEqual(result10, undefined);

        const result11 = parseGuest({ name: "John", guestOf: "husb", isFamily: true, dietary: "none", additionalGuest: { kind: "invalid", name: "guest", dietary: "none" } });
        assert.deepStrictEqual(result11, undefined);

        // Branch 7: Valid guest type
        const validGuest = { name: "John", guestOf: "husb", isFamily: true, dietary: "none", additionalGuest: { kind: "unknown", name: "", dietary: "" } };
        const result12 = parseGuest(validGuest);
        assert.deepStrictEqual(result12, validGuest);

        const validGuest2 = { name: "Weak", guestOf: "wife", isFamily: false, dietary: "none", additionalGuest: { kind: "1", name: "guest", dietary: "none" } };
        const result22 = parseGuest(validGuest2);
        assert.deepStrictEqual(result22, validGuest2);
    });

    it('toValidKind', function() {
        // Straigh line code, test thoroughly
        const result = toValidKind("0");
        assert.deepStrictEqual(result, "0");

        const result2 = toValidKind("1");
        assert.deepStrictEqual(result2, "1");

        const result3 = toValidKind("unknown");
        assert.deepStrictEqual(result3, "unknown");

        assert.throws(() => toValidKind("2"), Error);
        assert.throws(() => toValidKind("undefined"), Error);
    });
});
