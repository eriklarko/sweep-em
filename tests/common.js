// @flow

import { matcherHint } from 'jest-matcher-utils';

export function failWithUndefined(jest: *, actual: any) {
    return {
        pass: false,
        message: () =>
            matcherHint('.toBeDefined', 'received', '', {
                isNot: jest.isNot,
            }) +
            '\n\n' +
            `Received: ${jest.printReceived(actual)}`,
    };
}
