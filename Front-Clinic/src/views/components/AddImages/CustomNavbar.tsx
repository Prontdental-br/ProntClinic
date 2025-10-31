import React from "react";
import { Breadcrumbs, Link, Typography, IconButton, Tooltip } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

interface CustomNavbarProps {
  folderChain: { id: string; name: string }[] | null;
  onNavigate: (folderId: string) => void;
}

const CustomNavbar: React.FC<CustomNavbarProps> = ({ folderChain, onNavigate }) => {
  if (!folderChain || folderChain.length === 0) return null;

  const handleBack = () => {
    if (folderChain.length > 1) {
      const parent = folderChain[folderChain.length - 2];
      onNavigate(parent.id);
    }
  };

  return (
    <div
      style={{
        padding: "8px 16px",
        borderBottom: "1px solid #ddd",
        display: "flex",
        alignItems: "center",
        gap: "8px",
      }}
    >
      <Tooltip title="Voltar">
        <span>
          <IconButton
            onClick={handleBack}
            disabled={folderChain.length <= 1}
            size="small"
          >
            <ArrowBackIcon />
          </IconButton>
        </span>
      </Tooltip>

      <Breadcrumbs aria-label="breadcrumb" sx={{ flexGrow: 1 }}>
        {folderChain.map((folder, index) => {
          const displayName = folder.name === "Root" ? "Geral" : folder.name;

          return index < folderChain.length - 1 ? (
            <Link
              key={folder.id}
              underline="hover"
              color="primary"
              onClick={() => onNavigate(folder.id)}
              sx={{ cursor: "pointer" }}
            >
              {displayName}
            </Link>
          ) : (
            <Typography key={folder.id} color="text.primary">
              {displayName}
            </Typography>
          );
        })}
      </Breadcrumbs>
    </div>
  );
};

export default CustomNavbar;
