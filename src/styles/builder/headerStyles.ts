export const ParentFlexProps = {
    direction: "row",
    as: "header",
    height: "4em",
    width: "100%",
    align: "center",
    justify: "space-between",
    borderBottomWidth: "1px",
    bg: "bg.sold",
    paddingLeft: "1.5em",
    paddingRight: "1em",
    boxShadow: "0 0 5px 0 rgba(0, 0, 0, 0.1)",
    borderBottom: "1px solid gray",
    zIndex: 1000,
}

export const child1FlexProps = {
    direction: "row",
    align: "flex-start",
    justify: "flex-start",
    flex: 1,
}

    export const innerChild2Flex1Props = {
        direction: "row",
        justify: "center",
        align: "center", 
        gap: 16,
        bg: "white", 
        shadow: "sm", 
        padding: "3px", 
        marginLeft: "3em",
    }

export const child2FlexProps = {
    direction: "row",
    align: "center",
    justify: "flex-end",
    gap: 20,
    flex: 1,
    paddingRight: "1.5em",
}

export const iconButtonProps = {
    variant: "outline",
    size: "14px",
    cursor: "pointer",
    padding: "5px",
    zIndex: 1000,
}

export const tooltipStyle = {
    background: "#fff",
    color: "#333333",
    fontSize: "14px",
    fontWeight: "normal",
    borderRadius: "5px",
    padding: "2px 8px",
    boxShadow: "0 0 5px 0 rgba(0, 0, 0, 0.2)",
    marginTop: "10px",
}

export const tooltipStyleLogo = {
    background: "#fff",
    color: "#80a3ff",
    fontSize: "14px",
    fontWeight: "normal",
    borderRadius: "5px",
    padding: "2px 8px",
    boxShadow: "0 0 5px 0 rgba(0, 0, 0, 0.2)",
    marginTop: "10px",
}

export const tabsListStyle = {
    width: '100%',
    display: 'flex',
    direction: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '10px',
    fontSize: '12px',
    fontWeight: '500',
}

export const tabsTriggerStyle = {
    fontSize: '14px',
    fontWeight: '500',
}