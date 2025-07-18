declare const JwtStrategy_base: new (...args: any) => any;
export declare class JwtStrategy extends JwtStrategy_base {
    constructor();
    validate(payload: any): Promise<{
        sub: any;
        email: any;
        role: any;
        agency_id: any;
    }>;
}
export {};
