export const projectInfoBoxStyle = {
    flex: '1',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'center',
    padding: '15px 25px',
    gap: '30px',
    backgroundColor: 'var(--foreground-dark)',
    borderTop: '1px solid var(--border-dark)',
};

export const nameDescIdStyle = {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '25px',
    fontSize: "0.8rem",
    fontWeight: "bold",
};

export const nameDescTextStyle = {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '10px',
    fontWeight: "normal",
};

export const descTextStyle = {
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    maxWidth: "3vw",
    fontWeight: "normal",
};

export const programIdStyle = {
    display: 'flex',
    flexDirection: 'row',
    gap: '10px',
    justifyContent: 'center',
    alignItems: 'center',
    fontWeight: "normal",
};

export const programIdTextStyle = {
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    maxWidth: "3vw",
};

export const buttonWrapperStyle = {
    direction: 'row',
    width: '100%',
    gap: '20px',
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    fontWeight: "normal",
};

export const buttonStyle = {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    width: '100%',
    fontSize: '0.75rem',
    //border: '1px solid',
    borderRadius: '5px',
    whiteSpace: 'nowrap',
    padding: '5px 10px',
    cursor: "pointer",
    zIndex: 1000,
    margin: '5px 1px',

};

export const tooltipStyle = {
    backgroundColor: '#80a3ff',
    color: 'white',
    zIndex: 2000,
    padding: '5px 10px',
    borderRadius: '5px',
    fontSize: '0.75rem',
};

export const deployModalButtonStyle = {
    fontSize: '14px',
    padding: '5px 10px',
    borderRadius: '5px',
    border: '1px solid',
    cursor: 'pointer',
};