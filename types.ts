export type Order = {
    id: number;
    boSort: number;
    type: "SNIPPET" | "stories";
    title: string;
    description: string;
    price: [];
    isReposted: boolean;
    isSubscriptionAvailable: boolean;
    isViewed: boolean;
    isFresh: boolean;
    shouldRequestRefuseReasons: boolean;
    clientInfo: { name: string };
    schedule: string;
    query_id: string;
    score: number;
    collectionId: string;
    analyticsData: {
        score: number;
        concept_board: number;
        case_id: number | null;
        experiment_id: number;
    };
};

export type OrdersResponse = {
    data: {
        orders: Order[];
    };
};

export type User = {
    id: number;
    requestTimerId: NodeJS.Timer | null;
    sendedOrdersIds: number[];
};
