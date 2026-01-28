{
  description = "vim-jp-profile-stats development environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    flake-parts = {
      url = "github:hercules-ci/flake-parts";
      inputs.nixpkgs.follows = "nixpkgs";
    };
    nur = {
      url = "github:nix-community/NUR";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs = inputs @ { flake-parts, ... }:
    flake-parts.lib.mkFlake { inherit inputs; } {
      systems = [ "x86_64-linux" "aarch64-linux" "x86_64-darwin" "aarch64-darwin" ];

      perSystem = { system, ... }:
        let
          pkgs = import inputs.nixpkgs {
            inherit system;
            config.allowUnfree = true;
            overlays = [ inputs.nur.overlays.default ];
          };
        in
        {
          devShells.default = pkgs.mkShell {
            name = "vim-jp-profile-stats";

            packages = with pkgs; [
              git
              nodejs_22
              corepack_22

              terraform
              tflint
              trivy
              nur.repos.peacock0803sz.tfcmt
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
            '';
          };
        };
    };
}
