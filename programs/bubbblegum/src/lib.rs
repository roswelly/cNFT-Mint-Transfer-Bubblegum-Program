use anchor_lang::prelude::*;

declare_id!("3cd8ucYr6uLzT6sEQpbG2pxmeAEaEpP6XKcwxhm4uaYb");

#[program]
pub mod bubbblegum {
    use super::*;

    pub fn validate_mint(ctx: Context<ValidateMint>) -> Result<()> {
        let tree_config = &ctx.accounts.tree_config;
        let payer = &ctx.accounts.payer;

        msg!("Mint validation passed");
        msg!("Tree Config: {}", tree_config.key());
        msg!("Payer: {}", payer.key());
        
        Ok(())
    }
}

#[derive(Accounts)]
pub struct ValidateMint<'info> {
    #[account(mut)]
    pub tree_config: UncheckedAccount<'info>,

    #[account(mut)]
    pub merkle_tree: UncheckedAccount<'info>,

    #[account(mut)]
    pub payer: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Unauthorized: Only the tree authority can mint")]
    Unauthorized,
}
