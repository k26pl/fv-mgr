import NextLink from "./NextLink"
import MuiLink from "@mui/material/Link";
import type { LinkProps } from "@mui/material/Link";

export default function Link(props:LinkProps){
    return (<MuiLink component={NextLink} {...props} color="inherit">{props.children}</MuiLink>)
}
