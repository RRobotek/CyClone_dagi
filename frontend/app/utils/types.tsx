//'use client';
/*
struct Clone {
    address owner;
    string img_hash;
    string[] kb_hash;
    uint256 price; // price per second (in wei)
    int16 rating;

    string name;
    string description;

    bool is_active;
}
*/

type CloneType = {
    owner: string;
    img_hash: string;
    price: bigint;
    rating: number;
    name: string;
    description: string;
    is_active: boolean;
    id: bigint;
};

function toClone(data: any): CloneType {
    return {
        owner: data[0],
        img_hash: data[1],
        price: BigInt(data[2]),
        rating: Number(data[3]),
        name: data[4],
        description: data[5],
        is_active: data[6],
        id: BigInt(data[7]),
    };
}

export type { CloneType };
export { toClone };
