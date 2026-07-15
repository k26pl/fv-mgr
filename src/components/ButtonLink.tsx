import NextLink from "./NextLink"
import MuiBtn from "@mui/material/Button";
import type { ButtonProps } from "@mui/material/Button";

export default function Link(props:ButtonProps){
    return (<MuiBtn component={NextLink} color="inherit" to={props.href} {...props} style={{...(props.style || {}), textAlign:"center"}}>{props.children}</MuiBtn>)
}
