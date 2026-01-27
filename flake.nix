{
  description = "vim-jp-profile-stats development environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    flake-parts.url = "github:hercules-ci/flake-parts";
  };

  outputs = inputs @ { flake-parts, ... }:
    flake-parts.lib.mkFlake { inherit inputs; } {
      systems = [ "x86_64-linux" "aarch64-linux" "x86_64-darwin" "aarch64-darwin" ];

      perSystem = { pkgs, system, ... }: {
        devShells.default = pkgs.mkShell {
          name = "vim-jp-profile-stats";

          packages = with pkgs; [
            git
            python313
            uv
          ];

          env = {
            PROJECT_NAME = "vim-jp-profile-stats";
          };

          shellHook = ''
            # Load .env file if it exists
            if [ -f .env ]; then
              set -a
              source .env
              set +a
            fi

            # Sync uv dependencies
            uv sync --all-extras
          '';
        };
      };
    };
}
