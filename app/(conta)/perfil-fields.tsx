import { estados, type StudentProfile } from "@/lib/auth/profile";

export default function PerfilFields({ perfil }: { perfil?: StudentProfile }) {
  return <fieldset className="conta-profile-fields">
    <legend>Dados complementares (opcionais)</legend>
    <label className="conta-field">
      Data de nascimento
      <input type="date" name="dataNascimento" autoComplete="bday" defaultValue={perfil?.dataNascimento} />
    </label>
    <label className="conta-field">
      Bairro
      <input name="bairro" autoComplete="address-level3" maxLength={100} defaultValue={perfil?.bairro} />
    </label>
    <div className="conta-location">
      <label className="conta-field">
        Município
        <input name="municipio" autoComplete="address-level2" maxLength={100} defaultValue={perfil?.municipio} />
      </label>
      <label className="conta-field">
        UF
        <select name="uf" autoComplete="address-level1" defaultValue={perfil?.uf ?? ""}>
          <option value="">Selecione</option>
          {estados.map((uf) => <option value={uf} key={uf}>{uf}</option>)}
        </select>
      </label>
    </div>
  </fieldset>;
}
