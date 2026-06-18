export type NodeType = "Link" | "Node" | "Divider";
export type Variant = "primary" | "secondary" | "accent";

export interface TreeNode {
    title: string;
    icon: string;
    variant?: Variant;
    type: NodeType;
    nodes?: TreeNode[];
    onClick?: () => void;
    href?: string;
    open?: Boolean;
}

export interface TreeStateContext {
    open: Boolean;
    top: TreeNode | null;
    body: TreeNode[];
    bottom: TreeNode[];
}
