"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtUtils = void 0;
class JwtUtils {
    static extractAgencyId(token, jwtService) {
        try {
            const payload = jwtService.decode(token);
            if (!payload || !payload['agencyId']) {
                throw new Error('Invalid token or missing agencyId');
            }
            return payload['agencyId'];
        }
        catch (error) {
            throw new Error('Invalid token');
        }
    }
}
exports.JwtUtils = JwtUtils;
//# sourceMappingURL=jwt.utils.js.map