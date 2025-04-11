export const nodeBoxStyle = {
    minWidth: '240px',
    maxWidth: '280px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    border: '1px solid var(--node-border-dark)',
    padding: '0px',
    borderRadius: '8px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
    position: 'relative',
    fontFamily: 'sans-serif',
    fontSize: '12px',
    fontWeight: "normal",
    transition: 'box-shadow 0.3s',
    '&:hover': {
        boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
    }
}

export const headerStyle = {
    direction: "row", 
    justifyContent: "flex-start",
    alignItems: "center",
    gap: "8px", 
    padding: "12px 16px",
    fontSize: "14px",
    fontWeight: "bold",
    borderTopRightRadius: "8px",
    borderTopLeftRadius: "8px",
    color: "#ffffff",
}

export const headerTextStyle = {
    fontSize: "11.5px",
    fontWeight: "medium",
    maxWidth: "100%",
    textOverflow: "ellipsis",
    overflow: "hidden",
    whiteSpace: "nowrap",
}

export const nodeContentStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    padding: "16px",
    overflow: 'hidden',
}

export const nodeFieldBoxStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    marginBottom: "8px",
    background: 'var(--node-section-bg-dark)',
    padding: '12px',
    borderRadius: '6px',
}

export const nodeHandleStyle = {
    border: "none",
    width: "5px",
    height: "5px",
    cursor: "pointer"
}

export const nodeBadgeStyle = {
    fontSize: '10px',
    padding: '2px 6px',
    borderRadius: '4px',
    fontWeight: 'medium',
}

export const sectionHeaderStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 12px',
    background: 'var(--header-gradient-start)',
    borderBottom: '1px solid var(--node-border-dark)',
}

export const sectionBarStyle = {
    width: '4px',
    height: '16px',
    borderRadius: '2px',
    marginRight: '8px',
}

export const circleIconStyle = {
    background: 'rgba(255,255,255,0.1)', 
    borderRadius: '50%',
    padding: '6px',
    marginRight: '8px',
}