export type Place = {
    ID: number;
    Name: string;
    UserID: number;
    Latitude: number;
    Longitude: number;
};

export type User = {
    ID: number;
    Name: string;
    Password?: string;
    Token?: string;
};